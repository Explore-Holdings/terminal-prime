<?php

namespace Tests\Feature;

use App\Http\Controllers\CustomerController;
use App\Models\Customer;
use App\Models\Trip;
use App\Models\TripFinance;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AssignmentExtrasTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->integer('session_id');
            $table->string('duty_status');
            $table->string('registration_number')->nullable();
            $table->timestamps();
        });
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        (require database_path('migrations/2026_06_04_042536_create_customers_table.php'))->up();
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            foreach ((new Trip)->getFillable() as $field) {
                $table->string($field)->nullable();
            }
            $table->timestamps();
        });
        Schema::create('trip_finances', function (Blueprint $table) {
            $table->id();
            $extras = ['location_vehicle_price_id', 'city_name', 'base_driver_share', 'extra_km', 'extra_price'];
            foreach (array_diff((new TripFinance)->getFillable(), $extras) as $field) {
                $table->string($field)->nullable();
            }
            $table->timestamps();
        });
        (require database_path('migrations/2026_10_30_000002_add_assignment_extras_to_trip_finances_table.php'))->up();
        Schema::create('location_vehicle_prices', function (Blueprint $table) {
            $table->id();
            $table->string('city');
            $table->decimal('sedan', 12, 2);
        });
        Schema::create('user_login_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->nullable();
            $table->timestamp('login_at')->nullable();
            $table->timestamp('logout_at')->nullable();
        });
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->integer('driver_id')->nullable();
            $table->string('fcm_token')->nullable();
        });
        Schema::create('petty_cash_returns', function (Blueprint $table) {
            $table->id();
            $table->integer('customer_id');
        });
        DB::table('drivers')->insert(['id' => 1, 'session_id' => 1, 'duty_status' => 'on_duty']);
        DB::table('agents')->insert(['id' => 1]);
        DB::table('customers')->insert(['id' => 1, 'agent_id' => 1, 'name' => 'Guest']);
        DB::table('location_vehicle_prices')->insert(['id' => 1, 'city' => 'Kandy', 'sedan' => 5000]);
        $pdf = \Mockery::mock(\Barryvdh\DomPDF\PDF::class);
        $pdf->shouldReceive('save')->andReturnSelf();
        Pdf::shouldReceive('loadView')->andReturn($pdf);
    }

    private function assign(array $overrides = []): void
    {
        $request = Request::create('/customers/1/assign-trip', 'POST', array_replace([
            'driver_id' => 1, 'agent_id' => 1, 'total_amount' => 10000,
            'driver_share' => 5000, 'agent_share' => 0, 'balance' => 5000,
            'is_custom_rate' => true,
        ], $overrides));
        (new CustomerController)->assignTrip($request, Customer::findOrFail(1));
    }

    public function test_city_driver_payout_includes_extra_charge_and_keeps_the_breakdown(): void
    {
        $this->assign(['location_vehicle_price_id' => 1, 'base_driver_share' => 5000, 'extra_km' => 12.5, 'extra_price' => 750.25]);
        $finance = TripFinance::firstOrFail();
        $this->assertEquals(1, $finance->driver_id);
        $this->assertEquals(1, $finance->location_vehicle_price_id);
        $this->assertSame('Kandy', $finance->city_name);
        $this->assertSame('5000.00', $finance->base_driver_share);
        $this->assertSame('12.50', $finance->extra_km);
        $this->assertSame('750.25', $finance->extra_price);
        $this->assertSame('5750.25', $finance->driver_share);
        $this->assertSame('4249.75', $finance->balance);
        $this->assertEquals(5000, DB::table('location_vehicle_prices')->value('sedan'));

        $html = view('invoices.trip-invoice', [
            'tripNumber' => 1, 'invoiceNumber' => 'TEST', 'bookingType' => 'Transfer',
            'isTour' => false, 'isOutsource' => false, 'tourDestinations' => '',
            'dropoffLocation' => 'Kandy', 'vehicleReg' => 'ABC-1234', 'vehicleModel' => 'Sedan',
            'driverName' => 'Driver', 'driverContact' => '-', 'dispatchDate' => null,
            'days' => null, 'status' => 'Assigned', 'driverPayout' => $finance->driver_share,
            'dailyRate' => null, 'driverRatePercent' => 0, 'outsourceAdvance' => 0,
            'extraKm' => $finance->extra_km, 'extraPrice' => $finance->extra_price, 'driverCity' => $finance->city_name,
        ])->render();
        $this->assertStringContainsString('12.50 extra km', $html);
        $this->assertStringContainsString('750.25 extra (included in driver payout)', $html);
        $this->assertStringContainsString('LKR 5,750.25', $html);
    }

    public function test_assignments_without_extras_keep_the_existing_payout(): void
    {
        $this->assign();
        $finance = TripFinance::firstOrFail();
        $this->assertSame('5000.00', $finance->driver_share);
        $this->assertSame('0.00', $finance->extra_km);
        $this->assertSame('0.00', $finance->extra_price);
    }

    public function test_trip_uses_latest_finance_record_instead_of_older_zero_extras(): void
    {
        TripFinance::create(['trip_id' => 1, 'driver_id' => 99, 'driver_share' => 5000]);
        $this->assign(['location_vehicle_price_id' => 1, 'base_driver_share' => 5000, 'extra_km' => 30, 'extra_price' => 1200]);
        $trip = Trip::with('tripFinance')->firstOrFail();
        $this->assertSame(TripFinance::latest('id')->firstOrFail()->id, $trip->tripFinance->id);
        $this->assertEquals(1, $trip->tripFinance->driver_id);
        $this->assertSame('30.00', $trip->tripFinance->extra_km);
        $this->assertSame('1200.00', $trip->tripFinance->extra_price);
        $this->assertSame('6200.00', $trip->tripFinance->driver_share);
    }

    public function test_extras_without_a_city_roll_back_the_assignment(): void
    {
        try {
            $this->assign(['extra_km' => 10, 'extra_price' => 500]);
            $this->fail('A city must be selected.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('location_vehicle_price_id', $exception->errors());
        }
        $this->assertSame(0, Trip::count());
        $this->assertSame(0, TripFinance::count());
        $this->assertSame('on_duty', DB::table('drivers')->value('duty_status'));
    }

    public function test_negative_extra_values_are_rejected(): void
    {
        $this->expectException(ValidationException::class);
        $this->assign(['extra_km' => -1, 'extra_price' => -1]);
    }
}
