<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->string('shift_id')->nullable()->index();
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->string('payment_shift_id')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['payment_shift_id', 'paid_at']);
        });
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn('shift_id');
        });
    }
};
