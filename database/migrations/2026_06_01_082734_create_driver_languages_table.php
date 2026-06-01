<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_languages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('driver_id')
                ->constrained('drivers')
                ->cascadeOnDelete();

            $table->string('language_name');

            $table->enum('speaking_level', [
                'Basic',
                'Intermediate',
                'Fluent'
            ])->nullable();

            $table->enum('reading_level', [
                'Basic',
                'Intermediate',
                'Fluent'
            ])->nullable();

            $table->enum('writing_level', [
                'Basic',
                'Intermediate',
                'Fluent'
            ])->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_languages');
    }
};