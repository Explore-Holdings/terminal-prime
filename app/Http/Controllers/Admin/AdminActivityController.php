<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\UserLoginLog;
use App\Services\AuditLogger;
use App\Services\DeviceDetector;
use App\Services\GeoLocationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminActivityController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user?->loadMissing('role');
        $role = strtolower($user?->role?->name ?? '');

        if (!in_array($role, ['admin', 'executive'])) {
            abort(403, 'Unauthorized. Admin access only.');
        }

        // Enforce password unlock protection
        if (!session('admin_unlocked')) {
            return redirect()->route('dashboard')->with('error', 'Please verify your password to access the Admin module.');
        }

        $activeTab = $request->query('tab', 'audit'); // 'audit' or 'logins'

        // ── 1. AUDIT LOGS QUERY ──
        $auditQuery = AuditLog::with('user.role')->latest('created_at');

        // Filter: Action
        $actionFilter = $request->query('action');
        if (!empty($actionFilter) && $actionFilter !== 'all') {
            if ($actionFilter === 'exports') {
                $auditQuery->where(function ($q) {
                    $q->where('action', 'like', '%EXPORT%');
                });
            } else {
                $auditQuery->where('action', strtoupper($actionFilter));
            }
        }

        // Filter: Table / Entity
        $tableFilter = $request->query('table');
        if (!empty($tableFilter) && $tableFilter !== 'all') {
            $auditQuery->where('table_name', $tableFilter);
        }

        // Filter: Search Keyword
        $search = trim($request->query('search', ''));
        if (!empty($search)) {
            $auditQuery->where(function ($q) use ($search) {
                $q->where('task_done', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('device_id', 'like', "%{$search}%")
                  ->orWhere('record_id', 'like', "%{$search}%")
                  ->orWhere('table_name', 'like', "%{$search}%");
            });
        }

        // Filter: Date Range
        $dateRange = $request->query('range', 'all');
        if ($dateRange === 'today') {
            $auditQuery->whereDate('created_at', today());
        } elseif ($dateRange === 'week') {
            $auditQuery->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($dateRange === 'month') {
            $auditQuery->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
        } elseif ($dateRange === 'custom') {
            $from = $request->query('from');
            $to = $request->query('to');
            if ($from) {
                $auditQuery->where('created_at', '>=', Carbon::parse($from)->startOfDay());
            }
            if ($to) {
                $auditQuery->where('created_at', '<=', Carbon::parse($to)->endOfDay());
            }
        }

        $auditPerPage = (int) $request->query('audit_per_page', 15);
        $auditLogsPaginated = $auditQuery->paginate($auditPerPage, ['*'], 'audit_page')
            ->appends(array_merge($request->query(), ['tab' => 'audit']));

        // ── 2. RECENT LOGIN LOGS QUERY ──
        $loginQuery = UserLoginLog::with('user.role')->latest('login_at');

        $loginSearch = trim($request->query('login_search', ''));
        if (!empty($loginSearch)) {
            $loginQuery->where(function ($q) use ($loginSearch) {
                $q->where('ip_address', 'like', "%{$loginSearch}%")
                  ->orWhere('device_id', 'like', "%{$loginSearch}%")
                  ->orWhere('location', 'like', "%{$loginSearch}%")
                  ->orWhere('browser', 'like', "%{$loginSearch}%")
                  ->orWhere('shift_id', 'like', "%{$loginSearch}%")
                  ->orWhereHas('user', function ($uq) use ($loginSearch) {
                      $uq->where('name', 'like', "%{$loginSearch}%")
                         ->orWhere('email', 'like', "%{$loginSearch}%");
                  });
            });
        }

        $loginPerPage = (int) $request->query('login_per_page', 10);
        $loginsPaginated = $loginQuery->paginate($loginPerPage, ['*'], 'login_page')
            ->appends(array_merge($request->query(), ['tab' => 'logins']));

        $mappedLogins = $loginsPaginated->getCollection()->map(function ($log) {
            $deviceType = $log->device_type;
            $operatingSystem = $log->operating_system;
            $browser = $log->browser;
            $device = $log->device_name;
            $location = $log->location;
            $latitude = $log->latitude;
            $longitude = $log->longitude;

            if (empty($deviceType) && !empty($log->user_agent)) {
                $detected = DeviceDetector::detect($log->user_agent);
                $deviceType = $detected['device_type'];
                $operatingSystem = $detected['operating_system'];
                $browser = $detected['browser'];
                $device = $detected['device_name'];
            }

            if (empty($location) && !empty($log->ip_address)) {
                $geo = GeoLocationService::locate($log->ip_address);
                $location = $geo['location'];
                $latitude = $latitude ?? $geo['latitude'];
                $longitude = $longitude ?? $geo['longitude'];
            }

            return [
                'id'               => $log->id,
                'user_id'          => $log->user_id,
                'user_name'        => $log->user?->name ?? 'Unknown User',
                'user_email'       => $log->user?->email ?? '',
                'user_role'        => $log->user?->role?->name ?? 'Staff',
                'ip_address'       => $log->ip_address ?? '127.0.0.1',
                'device_id'        => $log->device_id,
                'shift_id'         => $log->shift_id,
                'device_type'      => $deviceType ?: 'Desktop',
                'device_name'      => $device ?: 'Personal Computer',
                'operating_system' => $operatingSystem ?: 'Windows',
                'browser'          => $browser ?: 'Web Browser',
                'latitude'         => $latitude,
                'longitude'        => $longitude,
                'location'         => $location ?: 'Local Station',
                'status'           => $log->status ?: ($log->logout_at ? 'logged_out' : 'active'),
                'login_at'         => $log->login_at?->toIso8601String() ?? $log->login_at,
                'logout_at'        => $log->logout_at?->toIso8601String() ?? $log->logout_at,
            ];
        });

        // ── 3. OVERVIEW STATS ──
        $todayStart = now()->startOfDay();
        $stats = [
            'total_actions_today' => AuditLog::where('created_at', '>=', $todayStart)->count(),
            'creates_today'       => AuditLog::where('created_at', '>=', $todayStart)->where('action', 'CREATE')->count(),
            'updates_today'       => AuditLog::where('created_at', '>=', $todayStart)->where('action', 'UPDATE')->count(),
            'deletes_today'       => AuditLog::where('created_at', '>=', $todayStart)->where('action', 'DELETE')->count(),
            'exports_today'       => AuditLog::where('created_at', '>=', $todayStart)->where('action', 'like', '%EXPORT%')->count(),
            'active_logins'       => UserLoginLog::where('status', 'active')->whereNull('logout_at')->where('login_at', '>=', now()->subHours(12))->count(),
        ];

        // Available tables in audit logs for filtering
        $distinctTables = AuditLog::select('table_name')
            ->whereNotNull('table_name')
            ->distinct()
            ->pluck('table_name')
            ->values()
            ->all();

        return Inertia::render('Admin/Index', [
            'activeTab'     => $activeTab,
            'stats'         => $stats,
            'tables'        => $distinctTables,
            'filters'       => [
                'action'       => $actionFilter ?: 'all',
                'table'        => $tableFilter ?: 'all',
                'search'       => $search,
                'range'        => $dateRange,
                'from'         => $request->query('from', ''),
                'to'           => $request->query('to', ''),
                'login_search' => $loginSearch,
            ],
            'auditLogs'     => [
                'data'         => $auditLogsPaginated->items(),
                'current_page' => $auditLogsPaginated->currentPage(),
                'last_page'    => $auditLogsPaginated->lastPage(),
                'per_page'     => $auditLogsPaginated->perPage(),
                'total'        => $auditLogsPaginated->total(),
                'from'         => $auditLogsPaginated->firstItem(),
                'to'           => $auditLogsPaginated->lastItem(),
                'links'        => $auditLogsPaginated->linkCollection()->toArray(),
            ],
            'recentLogins'  => [
                'data'         => $mappedLogins->values()->all(),
                'current_page' => $loginsPaginated->currentPage(),
                'last_page'    => $loginsPaginated->lastPage(),
                'per_page'     => $loginsPaginated->perPage(),
                'total'        => $loginsPaginated->total(),
                'from'         => $loginsPaginated->firstItem(),
                'to'           => $loginsPaginated->lastItem(),
                'links'        => $loginsPaginated->linkCollection()->toArray(),
            ],
        ]);
    }

    /**
     * Export audit logs to CSV/Excel.
     */
    public function export(Request $request)
    {
        $user = $request->user();
        $user?->loadMissing('role');
        $role = strtolower($user?->role?->name ?? '');

        if (!in_array($role, ['admin', 'executive'])) {
            abort(403);
        }

        $query = AuditLog::latest('created_at');

        $action = $request->query('action');
        if (!empty($action) && $action !== 'all') {
            if ($action === 'exports') {
                $query->where('action', 'like', '%EXPORT%');
            } else {
                $query->where('action', strtoupper($action));
            }
        }

        $table = $request->query('table');
        if (!empty($table) && $table !== 'all') {
            $query->where('table_name', $table);
        }

        $search = trim($request->query('search', ''));
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('task_done', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('device_id', 'like', "%{$search}%");
            });
        }

        $logs = $query->take(2000)->get();

        AuditLogger::logExport(
            'EXCEL_EXPORT',
            "Exported Audit Logs to CSV/Excel (" . count($logs) . " records)",
            'audit_logs',
            ['records_exported' => count($logs)]
        );

        $filename = "Terminal_Prime_Audit_Logs_" . now()->format('Y-m-d_His') . ".csv";

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Log ID',
                'Date & Time',
                'Action',
                'Target Entity / Table',
                'Record ID',
                'Task Done',
                'User Name',
                'User Role',
                'IP Address',
                'Device ID',
                'Request Path',
            ]);

            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->id,
                    $log->created_at?->format('Y-m-d H:i:s') ?? '',
                    $log->action,
                    $log->table_name ?? 'General',
                    $log->record_id ?? '-',
                    $log->task_done,
                    $log->user_name ?? 'System',
                    $log->user_role ?? '-',
                    $log->ip_address ?? '-',
                    $log->device_id ?? '-',
                    $log->url ?? '-',
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * API to log client-side action (e.g. CSV button click from frontend).
     */
    public function logClientExport(Request $request)
    {
        $validated = $request->validate([
            'export_type' => 'required|string|max:50',
            'description' => 'required|string|max:255',
            'table_name'  => 'nullable|string|max:100',
            'meta'        => 'nullable|array',
        ]);

        AuditLogger::logExport(
            $validated['export_type'],
            $validated['description'],
            $validated['table_name'] ?? null,
            $validated['meta'] ?? null
        );

        return response()->json(['success' => true]);
    }

    /**
     * Verify password to unlock Admin module access.
     */
    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();
        $user?->loadMissing('role');
        $role = strtolower($user?->role?->name ?? '');

        if (!in_array($role, ['admin', 'executive'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin role required.',
            ], 403);
        }

        $password = (string) $request->input('password');

        // Verify exclusively against the dedicated ADMIN_MODULE_PASSWORD in .env
        $expectedPassword = config('app.admin_module_password')
            ?: env('ADMIN_MODULE_PASSWORD', 'Admin@TP2026!');

        $isValid = hash_equals((string) $expectedPassword, $password);

        if ($isValid) {
            session(['admin_unlocked' => true]);

            AuditLogger::log(
                'SECURITY',
                "Admin module unlocked with password by {$user->name}",
                'users',
                (string) $user->id
            );

            return response()->json([
                'success'  => true,
                'redirect' => route('admin.index'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Incorrect password. Access denied.',
        ], 422);
    }

    /**
     * Re-lock the Admin module.
     */
    public function lock(Request $request)
    {
        session()->forget('admin_unlocked');
        return redirect()->route('dashboard')->with('success', 'Admin module locked.');
    }
}
