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
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();

            $table->string('registration_number')->unique();
            $table->date('registration_date')->nullable();
            $table->enum('registration_status', ['Pending', 'Approved', 'Rejected', 'Suspended'])->default('Approved');

            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('full_name')->nullable();
            $table->string('nic_number')->nullable();
            $table->string('passport_number')->nullable();

            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('nationality')->nullable();
            $table->string('marital_status')->nullable();

            $table->string('mobile_number')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('alternative_contact_number')->nullable();
            $table->string('email')->nullable();

            $table->text('permanent_address')->nullable();
            $table->text('current_address')->nullable();
            $table->string('city')->nullable();

            $table->string('driver_photo')->nullable();

            $table->string('previous_employer')->nullable();
            $table->text('previous_tourism_experience')->nullable();
            $table->text('accident_history')->nullable();
            $table->text('traffic_violation_history')->nullable();

            $table->enum('driver_status', ['Active', 'Inactive', 'Suspended', 'Rejected'])->default('Inactive');
            $table->enum('duty_status', ['off_duty','on_duty','on_trip'])->default('off_duty'); 
            $table->dateTime('checked_in_at')->nullable();
            $table->date('checked_out_at')->nullable();

            $table->decimal('amount', 10, 2)->nullable();
            $table->date('due_date')->nullable();
            $table->boolean('payment_received')->default(false)->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_attachment')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
