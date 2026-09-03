<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuditLogger
{
    /**
     * Models that should not be audited to avoid feedback loops and noise.
     */
    protected static array $ignoredModels = [
        AuditLog::class,
        \App\Models\UserLoginLog::class,
    ];

    /**
     * Sensitive attributes that should never be saved in audit logs.
     */
    protected static array $sensitiveAttributes = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get current client device ID from request, header, cookie or session.
     */
    public static function getDeviceId(): ?string
    {
        try {
            return request('device_id')
                ?: request()->header('X-Device-Id')
                ?: request()->cookie('terminal_device_id')
                ?: session('terminal_device_id')
                ?: null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Log an Eloquent Model lifecycle event (CREATE, UPDATE, DELETE).
     */
    public static function logModelEvent(string $action, string $eventName, array $data): void
    {
        try {
            $model = $data[0] ?? null;
            if (!$model instanceof Model) {
                return;
            }

            foreach (self::$ignoredModels as $ignored) {
                if ($model instanceof $ignored) {
                    return;
                }
            }

            $user = Auth::user();
            $table = $model->getTable();
            $recordId = (string) $model->getKey();
            $modelClass = class_basename($model);

            $oldValues = null;
            $newValues = null;
            $taskDone = '';

            if ($action === 'CREATE') {
                $rawNew = $model->getAttributes();
                $newValues = self::sanitizeAttributes($rawNew);
                $label = self::getModelIdentifierLabel($model);
                $taskDone = "Created new {$modelClass}" . ($recordId ? " #{$recordId}" : '') . ($label ? " ({$label})" : '');
            } elseif ($action === 'UPDATE') {
                $dirty = $model->getDirty();
                if (empty($dirty)) {
                    return; // No real changes
                }

                $rawOld = [];
                $rawNew = [];
                foreach ($dirty as $key => $newVal) {
                    $rawOld[$key] = $model->getOriginal($key);
                    $rawNew[$key] = $newVal;
                }

                $oldValues = self::sanitizeAttributes($rawOld);
                $newValues = self::sanitizeAttributes($rawNew);

                $changedFields = implode(', ', array_keys($newValues));
                $label = self::getModelIdentifierLabel($model);
                $taskDone = "Updated {$modelClass} #{$recordId}" . ($label ? " ({$label})" : '') . " [Fields: {$changedFields}]";
            } elseif ($action === 'DELETE') {
                $rawOld = $model->getOriginal();
                $oldValues = self::sanitizeAttributes($rawOld);
                $label = self::getModelIdentifierLabel($model);
                $taskDone = "Deleted {$modelClass} #{$recordId}" . ($label ? " ({$label})" : '');
            }

            self::storeLog([
                'user'       => $user,
                'action'     => $action,
                'table_name' => $table,
                'record_id'  => $recordId,
                'task_done'  => $taskDone,
                'old_values' => $oldValues,
                'new_values' => $newValues,
            ]);
        } catch (\Throwable $e) {
            Log::debug('AuditLogger model event failed: ' . $e->getMessage());
        }
    }

    /**
     * Log an export action (Excel, CSV, PDF, Print).
     */
    public static function logExport(string $exportType, string $taskDone, ?string $tableName = null, ?array $meta = null): void
    {
        try {
            self::storeLog([
                'user'       => Auth::user(),
                'action'     => strtoupper($exportType), // EXCEL_EXPORT, CSV_EXPORT, PDF_EXPORT
                'table_name' => $tableName ?: 'reports',
                'record_id'  => null,
                'task_done'  => $taskDone,
                'old_values' => null,
                'new_values' => $meta,
            ]);
        } catch (\Throwable $e) {
            Log::debug('AuditLogger export log failed: ' . $e->getMessage());
        }
    }

    /**
     * Log any custom administrative or operational task.
     */
    public static function log(string $action, string $taskDone, ?string $tableName = null, ?string $recordId = null, ?array $oldValues = null, ?array $newValues = null): void
    {
        try {
            self::storeLog([
                'user'       => Auth::user(),
                'action'     => strtoupper($action),
                'table_name' => $tableName,
                'record_id'  => $recordId,
                'task_done'  => $taskDone,
                'old_values' => $oldValues,
                'new_values' => $newValues,
            ]);
        } catch (\Throwable $e) {
            Log::debug('AuditLogger generic log failed: ' . $e->getMessage());
        }
    }

    /**
     * Persist log to audit_logs table.
     */
    protected static function storeLog(array $params): void
    {
        $user = $params['user'] ?? null;
        $ip = null;
        $url = null;
        $ua = null;

        try {
            $ip = request()->ip();
            $url = request()->path();
            $ua = request()->userAgent();
        } catch (\Throwable $e) {
            // CLI or queue environment
        }

        $deviceId = self::getDeviceId();

        // Detect user role name
        $roleName = null;
        if ($user) {
            $user->loadMissing('role');
            $roleName = $user->role?->name ?? 'User';
        }

        AuditLog::create([
            'user_id'    => $user?->id,
            'user_name'  => $user?->name ?? 'System / Guest',
            'user_role'  => $roleName,
            'action'     => $params['action'] ?? 'ACTION',
            'table_name' => $params['table_name'] ?? null,
            'record_id'  => $params['record_id'] ?? null,
            'task_done'  => $params['task_done'] ?? 'System Task Executed',
            'old_values' => $params['old_values'] ?? null,
            'new_values' => $params['new_values'] ?? null,
            'ip_address' => $ip,
            'device_id'  => $deviceId,
            'url'        => $url,
            'user_agent' => $ua,
            'created_at' => now(),
        ]);
    }

    /**
     * Strip sensitive keys from array.
     */
    protected static function sanitizeAttributes(?array $attributes): ?array
    {
        if (empty($attributes)) {
            return null;
        }

        foreach (self::$sensitiveAttributes as $key) {
            unset($attributes[$key]);
        }

        return $attributes;
    }

    /**
     * Extract human friendly identifying string from model if possible.
     */
    protected static function getModelIdentifierLabel(Model $model): ?string
    {
        return $model->getAttribute('name')
            ?: $model->getAttribute('full_name')
            ?: $model->getAttribute('title')
            ?: $model->getAttribute('booking_number')
            ?: $model->getAttribute('email')
            ?: null;
    }
}
