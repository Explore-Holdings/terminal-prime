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
        Schema::create('petty_cash_shift_logs', function (Blueprint $table) {
            $table->id();
            $table->string('shift_id');
            $table->decimal('ending_balance', 10, 2);
            $table->decimal('amount_spent', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('petty_cash_shift_logs');
    }
};
