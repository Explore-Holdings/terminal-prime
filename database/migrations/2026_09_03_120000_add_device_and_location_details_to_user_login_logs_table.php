<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_login_logs', function (Blueprint $table) {
            $table->string('device_id', 64)->nullable()->after('shift_id');
            $table->string('device_type', 50)->nullable()->after('user_agent');
            $table->string('device_name', 100)->nullable()->after('device_type');
            $table->string('operating_system', 100)->nullable()->after('device_name');
            $table->string('browser', 100)->nullable()->after('operating_system');
            $table->string('city', 100)->nullable()->after('browser');
            $table->string('region', 100)->nullable()->after('city');
            $table->string('country', 100)->nullable()->after('region');
            $table->string('country_code', 10)->nullable()->after('country');
            $table->decimal('latitude', 10, 7)->nullable()->after('country_code');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('location', 255)->nullable()->after('longitude');
            $table->string('status', 30)->default('active')->after('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_login_logs', function (Blueprint $table) {
            $table->dropColumn([
                'device_type',
                'device_name',
                'operating_system',
                'browser',
                'city',
                'region',
                'country',
                'country_code',
                'location',
                'status',
            ]);
        });
    }
};
