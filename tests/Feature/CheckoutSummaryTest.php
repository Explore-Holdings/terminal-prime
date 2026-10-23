<?php

namespace Tests\Feature;

use App\Http\Controllers\CounterController;
use App\Models\UserLoginLog;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CheckoutSummaryTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::create('user_login_logs', function (Blueprint $table) {
            $table->id(); $table->integer('user_id'); $table->string('shift_id')->nullable();
            $table->timestamp('login_at'); $table->timestamp('logout_at')->nullable();
        });
        Schema::create('agents', function (Blueprint $table) {
            $table->id(); $table->string('booking_type'); $table->integer('currency_updated_by')->nullable();
            $table->string('currency')->default('LKR'); $table->timestamps(); $table->softDeletes();
        });
        Schema::create('customers', function (Blueprint $table) {
            $table->id(); $table->integer('agent_id'); $table->string('name')->default('Guest');
            $table->string('payment_shift_id')->nullable(); $table->timestamp('paid_at')->nullable();
            $table->string('payment_method')->nullable(); $table->json('payment_notes')->nullable();
            $table->decimal('paid_amount')->default(0); $table->string('transaction_id')->nullable();
            $table->timestamps(); $table->softDeletes();
        });
        Schema::create('trips', function (Blueprint $table) {
            $table->id(); $table->integer('customer_id'); $table->integer('agent_id');
            $table->integer('driver_id')->nullable(); $table->string('shift_id')->nullable();
            $table->integer('trip_assigned_by'); $table->timestamp('trip_assigned_at'); $table->timestamps();
        });
        Schema::create('trip_finances', function (Blueprint $table) {
            $table->id(); $table->integer('trip_id');
        });
        UserLoginLog::insert([
            ['id' => 1, 'user_id' => 5, 'shift_id' => 'SHIFT-01', 'login_at' => '2026-10-23 08:00:00', 'logout_at' => '2026-10-23 12:00:00'],
            ['id' => 2, 'user_id' => 5, 'shift_id' => 'SHIFT-02', 'login_at' => '2026-10-23 10:00:00', 'logout_at' => '2026-10-23 14:00:00'],
        ]);
        DB::table('agents')->insert(['id' => 1, 'booking_type' => 'Rent a Car', 'currency_updated_by' => 5]);
    }

    private function summary(int $id): array
    {
        return (new \ReflectionMethod(CounterController::class, 'checkoutData'))
            ->invoke(new CounterController, UserLoginLog::findOrFail($id));
    }

    public function test_rentals_and_pos_payments_are_limited_to_their_shift(): void
    {
        DB::table('customers')->insert([
            ['id' => 1, 'agent_id' => 1, 'payment_shift_id' => 'SHIFT-01', 'payment_method' => 'POS', 'paid_amount' => 1500, 'transaction_id' => 'POS-ONE'],
            ['id' => 2, 'agent_id' => 1, 'payment_shift_id' => 'SHIFT-02', 'payment_method' => 'POS', 'paid_amount' => 9000, 'transaction_id' => 'POS-TWO'],
        ]);
        [$trips, $rentals, $payments] = $this->summary(1);
        $this->assertCount(0, $trips);
        $this->assertSame([1], $rentals->pluck('id')->all());
        $this->assertSame(1500.0, $payments['byMethod']['POS']['currencies']['LKR']);
        $this->assertSame('POS-ONE', $payments['posTransactions'][0]['transaction_id']);
        $this->assertCount(1, $payments['posTransactions']);

        $html = view('pdf.checkout-summary', [
            'log' => UserLoginLog::findOrFail(1),
            'user' => new \App\Models\User(['name' => 'Officer']),
            'trips' => $trips, 'rentACarBookings' => $rentals,
            'paymentSummary' => $payments, 'pettyCashReturns' => collect(),
        ])->render();
        $this->assertStringContainsString('Rent a Car Summary', $html);
        $this->assertStringContainsString('POS-ONE', $html);
        $this->assertStringNotContainsString('POS-TWO', $html);
    }

    public function test_legacy_trips_in_overlapping_sessions_resolve_to_one_shift_and_payments_are_not_duplicated(): void
    {
        DB::table('customers')->insert(['id' => 1, 'agent_id' => 1, 'payment_shift_id' => 'SHIFT-02',
            'payment_notes' => json_encode([['method' => 'POS', 'currency' => 'USD', 'amount' => 50]])]);
        foreach ([1, 2] as $id) {
            DB::table('trips')->insert(['id' => $id, 'agent_id' => 1, 'customer_id' => 1,
                'trip_assigned_by' => 5, 'trip_assigned_at' => '2026-10-23 11:00:00']);
        }
        $this->assertCount(0, $this->summary(1)[0]);
        [$trips, , $payments] = $this->summary(2);
        $this->assertCount(2, $trips);
        $this->assertSame(1, $payments['byMethod']['POS']['count']);
        $this->assertSame(50.0, $payments['byMethod']['POS']['currencies']['USD']);
    }

    public function test_transaction_reference_on_a_bank_transfer_is_not_a_pos_payment(): void
    {
        DB::table('customers')->insert(['agent_id' => 1, 'payment_shift_id' => 'SHIFT-01',
            'payment_notes' => json_encode([['method' => 'Bank Transfer', 'currency' => 'LKR', 'amount' => 100, 'transaction_id' => 'BANK-ONE']])]);
        $payments = $this->summary(1)[2];
        $this->assertSame([], $payments['posTransactions']);
        $this->assertSame(100.0, $payments['byMethod']['Bank Transfer']['currencies']['LKR']);
    }

    public function test_explicit_trip_shift_is_preserved_and_other_shift_payment_details_are_hidden(): void
    {
        DB::table('customers')->insert(['id' => 1, 'agent_id' => 1, 'payment_shift_id' => 'SHIFT-02',
            'payment_method' => 'POS', 'paid_amount' => 250, 'transaction_id' => 'OTHER-SHIFT',
            'payment_notes' => json_encode([['method' => 'POS', 'currency' => 'LKR', 'amount' => 250]])]);
        DB::table('trips')->insert(['agent_id' => 1, 'customer_id' => 1, 'shift_id' => 'SHIFT-01',
            'trip_assigned_by' => 5, 'trip_assigned_at' => '2026-10-23 11:00:00']);

        [$trips, , $payments] = $this->summary(1);
        $this->assertCount(1, $trips);
        $this->assertSame('SHIFT-01', $trips->first()->shift_id);
        $this->assertSame([], $trips->first()->customer->payment_notes);
        $this->assertNull($trips->first()->customer->transaction_id);
        $this->assertSame([], $payments['posTransactions']);
        $this->assertCount(0, $this->summary(2)[0]);
    }
}
