<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public const AVAILABLE_PERMISSIONS = [
        [
            'key' => 'dashboard',
            'label' => 'Dashboard',
            'path' => '/dashboard',
            'group' => 'Core Operations',
            'description' => 'System metrics, counters, and overall operational KPIs',
        ],
        [
            'key' => 'counter',
            'label' => 'Counter Desk',
            'path' => '/counter',
            'group' => 'Core Operations',
            'description' => 'Live vehicle queue, customer check-ins, and desk bookings',
        ],
        [
            'key' => 'trips',
            'label' => 'Tours & Trips',
            'path' => '/trips',
            'group' => 'Core Operations',
            'description' => 'Tour assignments, vehicle bookings, and dispatch logs',
        ],
        [
            'key' => 'drivers',
            'label' => 'Drivers Directory',
            'path' => '/drivers',
            'group' => 'Fleet & Logistics',
            'description' => 'Driver profiles, duty shifts, and assigned vehicles',
        ],
        [
            'key' => 'customers',
            'label' => 'Customers',
            'path' => '/customers',
            'group' => 'Customer Relations',
            'description' => 'Customer directory, bookings history, and invoicing',
        ],
        [
            'key' => 'chats',
            'label' => 'Customer Chats',
            'path' => '/chats',
            'group' => 'Customer Relations',
            'description' => 'Live chat inquiries and instant messaging',
        ],
        [
            'key' => 'customer_surveys',
            'label' => 'Customer Surveys',
            'path' => '/customer-surveys',
            'group' => 'Customer Relations',
            'description' => 'Customer feedback ratings and satisfaction surveys',
        ],
        [
            'key' => 'finance',
            'label' => 'Finance & Petty Cash',
            'path' => '/finance',
            'group' => 'Finance & Payouts',
            'description' => 'Cash flow, driver payouts, and shift balances',
        ],
        [
            'key' => 'accountant',
            'label' => 'Accountant Hub',
            'path' => '/accountant',
            'group' => 'Finance & Payouts',
            'description' => 'Payment slips verification and accountant approvals',
        ],
        [
            'key' => 'pricing_data',
            'label' => 'Pricing Data',
            'path' => '/pricing-data',
            'group' => 'Finance & Payouts',
            'description' => 'Vehicle fare rates, distance matrices, and tariff import',
        ],
        [
            'key' => 'manager_reports',
            'label' => 'Counter Manager',
            'path' => '/manager-reports',
            'group' => 'Reporting & Analytics',
            'description' => 'Managerial shift reports and printable tour summaries',
        ],
        [
            'key' => 'agent_driver',
            'label' => 'Agent & Driver Insights',
            'path' => '/agent-driver-insights',
            'group' => 'Reporting & Analytics',
            'description' => 'Performance analytics for ticketing agents and drivers',
        ],
        [
            'key' => 'reports',
            'label' => 'Executive Overview',
            'path' => '/reports',
            'group' => 'Reporting & Analytics',
            'description' => 'Executive business reports and graphical charts',
        ],
        [
            'key' => 'reports_hub',
            'label' => 'Reports Hub',
            'path' => '/reports-hub',
            'group' => 'Reporting & Analytics',
            'description' => 'Universal data exporter for trips, revenue, and audits',
        ],
        [
            'key' => 'dss',
            'label' => 'DSS (Decision Support)',
            'path' => '/dss',
            'group' => 'System Administration',
            'description' => 'Decision Support System and automated allocation insights',
        ],
        [
            'key' => 'users',
            'label' => 'Users & Permissions',
            'path' => '/users',
            'group' => 'System Administration',
            'description' => 'User management, role assignment, and access control',
        ],
        [
            'key' => 'admin',
            'label' => 'Admin Audit Panel',
            'path' => '/admin',
            'group' => 'System Administration',
            'description' => 'Full system audit logs, device trackers, and database changes',
        ],
    ];

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        $roleName = strtolower(trim($request->name));

        Role::create([
            'name' => $roleName,
            'permissions' => $request->input('permissions', []),
        ]);

        return back()->with('success', "Role '{$roleName}' created successfully.");
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        $isSystemAdmin = strtolower(trim($role->name)) === 'admin';
        $newName = $isSystemAdmin ? 'admin' : strtolower(trim($request->name));

        // If admin role, always keep all permissions
        $permissions = $isSystemAdmin
            ? array_column(self::AVAILABLE_PERMISSIONS, 'key')
            : ($request->input('permissions') ?? []);

        $role->update([
            'name' => $newName,
            'permissions' => $permissions,
        ]);

        return back()->with('success', "Role '{$role->name}' updated successfully.");
    }

    public function syncPermissions(Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permissions' => 'present|array',
            'permissions.*' => 'string',
        ]);

        $role = Role::findOrFail($request->role_id);

        if (strtolower(trim($role->name)) === 'admin') {
            return back()->with('error', 'The Admin role inherently retains access to all modules.');
        }

        $validKeys = array_column(self::AVAILABLE_PERMISSIONS, 'key');
        $filtered = array_values(array_intersect($request->input('permissions', []), $validKeys));

        $role->update([
            'permissions' => $filtered,
        ]);

        return back()->with('success', "Permissions updated for role '{$role->name}'.");
    }

    public function destroy(Role $role)
    {
        $protectedRoles = ['admin', 'staff', 'counter staff', 'driver', 'agent'];
        if (in_array(strtolower(trim($role->name)), $protectedRoles, true)) {
            return back()->with('error', "The built-in system role '{$role->name}' cannot be deleted.");
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', "Cannot delete role '{$role->name}' because it currently has {$role->users()->count()} assigned user(s).");
        }

        $roleName = $role->name;
        $role->delete();

        return back()->with('success', "Role '{$roleName}' deleted successfully.");
    }
}