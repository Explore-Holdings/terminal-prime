<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('customer_passport')->nullable();
            $table->string('name')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->integer('passenger_count')->nullable();
            $table->string('currency')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->enum('status', ['Pending','Approved','Rejected'])->default('Pending')->nullable();
            $table->timestamps();
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};