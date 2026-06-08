<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->string('customer_code')->unique()->nullable();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('mobile_number')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('country')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->string('passport_image')->nullable();
            $table->enum('status', ['New','Contacted','Quoted','Confirmed','Cancelled'])->default('New');
            $table->text('remarks')->nullable();
            $table->string('language_preference')->nullable();
            $table->integer('passenger_count')->default(1);
            $table->string('payment_method')->nullable()->nullable();
            $table->json('payment_notes')->nullable()->nullable();
            $table->decimal('paid_amount', 12, 2)->default(0)->nullable();
            $table->string('payment_status')->default('Pending')->nullable();
            $table->string('invoice_number')->nullable();
            $table->string('invoice_path')->nullable();
            $table->timestamps();
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};