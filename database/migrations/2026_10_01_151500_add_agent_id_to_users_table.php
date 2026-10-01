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
        Schema::table('users', function (Blueprint $table) {
            $table->string('agent_id')->nullable()->after('role_id');
        });

        // Assign AGNT-1, AGNT-2, etc. to any existing users with role 'agent'
        $agentRole = DB::table('roles')->whereRaw('LOWER(name) = ?', ['agent'])->first();
        if ($agentRole) {
            $existingAgentUsers = DB::table('users')
                ->where('role_id', $agentRole->id)
                ->orderBy('id', 'asc')
                ->get();

            $counter = 1;
            foreach ($existingAgentUsers as $u) {
                DB::table('users')
                    ->where('id', $u->id)
                    ->update(['agent_id' => 'AGNT-' . $counter]);
                $counter++;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('agent_id');
        });
    }
};
