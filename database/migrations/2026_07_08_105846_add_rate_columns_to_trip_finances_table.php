<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trip_finances', function (Blueprint $table) {
            $table->decimal('driver_rate', 5, 2)->default(0)->after('agent_id')->comment('Driver commission %');
            $table->decimal('agent_rate', 5, 2)->default(0)->after('driver_rate')->comment('Agent commission %');
            $table->boolean('is_custom_rate')->default(false)->after('agent_rate')->comment('Whether a custom rate was applied');
        });
    }

    public function down(): void
    {
        Schema::table('trip_finances', function (Blueprint $table) {
            $table->dropColumn(['driver_rate', 'agent_rate', 'is_custom_rate']);
        });
    }
};
