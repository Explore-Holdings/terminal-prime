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
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('user_name', 100)->nullable();
                $table->string('user_role', 50)->nullable();
                $table->string('action', 50)->index(); // CREATE, UPDATE, DELETE, EXCEL_EXPORT, etc.
                $table->string('table_name', 100)->nullable()->index();
                $table->string('record_id', 100)->nullable()->index();
                $table->text('task_done');
                $table->longText('old_values')->nullable();
                $table->longText('new_values')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->string('device_id', 64)->nullable()->index();
                $table->text('url')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->nullable()->index();
                $table->timestamp('updated_at')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
