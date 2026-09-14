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
        Schema::table('trip_finances', function (Blueprint $table) {
            $table->string('original_currency', 10)->nullable()->after('balance');
            $table->decimal('original_amount', 12, 2)->nullable()->after('original_currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trip_finances', function (Blueprint $table) {
            $table->dropColumn(['original_currency', 'original_amount']);
        });
    }
};
