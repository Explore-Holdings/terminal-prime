<?php

namespace Tests\Feature;

use App\Http\Controllers\CustomerController;
use App\Models\Agent;
use App\Models\Customer;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CustomerTravelDatesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(\Carbon\Carbon::parse('2026-10-30 00:15:00', 'Asia/Colombo'));
        DB::connection()->getPdo()->sqliteCreateFunction('regexp', fn ($pattern, $value) => preg_match('/'.$pattern.'/', $value ?? ''));

        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            foreach (['name', 'booking_type', 'dropoff_location', 'remarks', 'rent_start_date', 'rent_end_date', 'driver_rate_reason'] as $field) {
                $table->string($field)->nullable();
            }
            $table->integer('passenger_count')->default(1);
            $table->integer('processing_by')->nullable();
            $table->decimal('driver_rate')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        (require database_path('migrations/2026_06_04_042536_create_customers_table.php'))->up();
        Schema::table('customers', fn (Blueprint $table) => $table->integer('created_by')->nullable());
        (require database_path('migrations/2026_10_30_000000_add_travel_dates_to_customers_table.php'))->up();
    }

    private function save(array $data): Customer
    {
        $request = Request::create('/customers', 'POST', $data);
        $request->headers->set('Accept', 'application/json');
        $response = (new CustomerController)->store($request);

        return Customer::findOrFail($response->getData()->id);
    }

    public function test_tours_and_rentals_save_update_and_print_travel_dates(): void
    {
        foreach (['Tours', 'Rent a Car'] as $type) {
            $agent = Agent::create(['name' => 'Guest', 'booking_type' => $type]);
            $customer = $this->save([
                'agent_id' => $agent->id,
                'arrival_date' => '2026-11-01',
                'departure_date' => '2026-11-10',
            ]);
            $this->assertSame('2026-11-01', $customer->toArray()['arrival_date']);
            $this->assertSame('2026-11-10', $customer->toArray()['departure_date']);

            $customer = $this->save(['agent_id' => $agent->id, 'departure_date' => '2026-11-12']);
            $this->assertSame('2026-11-01', $customer->arrival_date->toDateString());
            $this->assertSame('2026-11-12', $customer->departure_date->toDateString());

            $html = view('invoices.customer-invoice', [
                'customer' => $customer->load('agent'), 'price' => 100, 'payments' => collect(),
            ])->render();
            $this->assertStringContainsString('Arrival Date', $html);
            $this->assertStringContainsString('01.11.2026', $html);
            $this->assertStringContainsString('Departure Date', $html);
            $this->assertStringContainsString('12.11.2026', $html);

            $customer = $this->save(['agent_id' => $agent->id, 'arrival_date' => null, 'departure_date' => null]);
            $this->assertNull($customer->arrival_date);
            $this->assertNull($customer->departure_date);
        }
    }

    public function test_departure_cannot_be_before_arrival(): void
    {
        $this->expectException(ValidationException::class);
        $this->save(['arrival_date' => '2026-11-10', 'departure_date' => '2026-11-01']);
    }

    public function test_invalid_dates_are_rejected(): void
    {
        $this->expectException(ValidationException::class);
        $this->save(['arrival_date' => '2026-02-30']);
    }

    public function test_departure_can_be_saved_without_arrival(): void
    {
        $agent = Agent::create(['name' => 'Guest', 'booking_type' => 'Tours']);
        $customer = $this->save(['agent_id' => $agent->id, 'departure_date' => '2026-11-10']);
        $this->assertNull($customer->arrival_date);
        $this->assertSame('2026-11-10', $customer->departure_date->toDateString());
    }

    public function test_past_arrival_and_departure_dates_are_rejected(): void
    {
        foreach (['arrival_date', 'departure_date'] as $field) {
            try {
                $this->save([$field => '2026-10-29']);
                $this->fail('Past dates must be rejected.');
            } catch (ValidationException $exception) {
                $this->assertArrayHasKey($field, $exception->errors());
            }
        }
    }

    public function test_today_is_allowed_for_both_dates(): void
    {
        $agent = Agent::create(['name' => 'Guest', 'booking_type' => 'Tours']);
        $customer = $this->save([
            'agent_id' => $agent->id, 'arrival_date' => '2026-10-30', 'departure_date' => '2026-10-30',
        ]);
        $this->assertSame('2026-10-30', $customer->arrival_date->toDateString());
        $this->assertSame('2026-10-30', $customer->departure_date->toDateString());
    }
}
