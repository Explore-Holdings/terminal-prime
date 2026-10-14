<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('roles', 'permissions')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->json('permissions')->nullable()->after('name');
            });
        }

        // Seed initial permissions based on existing hardcoded roles in AppSidebarLayout
        $initialPermissions = [
            'admin' => [
                'dashboard', 'dss', 'counter', 'manager_reports', 'finance', 'accountant',
                'drivers', 'customers', 'chats', 'agent_driver', 'trips', 'customer_surveys',
                'reports', 'reports_hub', 'pricing_data', 'users', 'admin'
            ],
            'executive' => [
                'dashboard', 'dss', 'counter', 'manager_reports', 'finance', 'accountant',
                'drivers', 'customers', 'chats', 'agent_driver', 'trips', 'customer_surveys',
                'reports', 'reports_hub', 'pricing_data'
            ],
            'executive staff' => [
                'dashboard', 'dss', 'counter', 'manager_reports', 'finance', 'accountant',
                'drivers', 'customers', 'chats', 'agent_driver', 'trips', 'customer_surveys',
                'reports', 'reports_hub', 'pricing_data'
            ],
            'coperate' => [
                'dashboard', 'dss', 'counter', 'finance', 'accountant', 'drivers',
                'customers', 'chats', 'agent_driver', 'trips', 'customer_surveys',
                'reports', 'reports_hub', 'pricing_data'
            ],
            'manager' => [
                'dashboard', 'counter', 'manager_reports', 'trips'
            ],
            'counter staff' => [
                'dashboard', 'counter', 'customers', 'trips'
            ],
            'staff' => [
                'dashboard', 'counter', 'customers', 'trips'
            ],
            'finance' => [
                'dashboard', 'finance', 'accountant', 'customers', 'agent_driver'
            ],
            'accountant' => [
                'accountant', 'drivers', 'customers', 'agent_driver'
            ],
            'driver' => [],
            'agent' => [],
        ];

        foreach ($initialPermissions as $roleName => $perms) {
            DB::table('roles')
                ->whereRaw('LOWER(TRIM(name)) = ?', [strtolower(trim($roleName))])
                ->update(['permissions' => json_encode($perms)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('roles', 'permissions')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropColumn('permissions');
            });
        }
    }
};
