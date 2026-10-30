<?php

namespace Tests\Feature;

use App\Http\Controllers\FinanceController;
use App\Models\Customer;
use App\Models\OutsourceVehicle;
use App\Models\PaymentSlip;
use App\Models\TripFinance;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class BulkSlipUploadTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->actingAs((new User)->forceFill(['id' => 12, 'name' => 'Finance']));
        Schema::create('trip_finances', function (Blueprint $table) {
            $table->id();
            $table->integer('trip_id');
        });
        Schema::create('outsource_vehicles', fn (Blueprint $table) => $table->id());
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
        });
        Schema::create('payment_slips', function (Blueprint $table) {
            $table->id();
            $table->integer('trip_finance_id')->nullable();
            $table->integer('outsource_vehicle_id')->nullable();
            $table->integer('customer_id')->nullable();
            $table->text('slip_des')->nullable();
            $table->string('slip_path');
            $table->integer('uploaded_by')->nullable();
            $table->string('status');
            $table->timestamps();
        });
        DB::table('trip_finances')->insert(['id' => 1, 'trip_id' => 101]);
        DB::table('outsource_vehicles')->insert(['id' => 1]);
        DB::table('customers')->insert(['id' => 1]);
    }

    private function request(?array $transactions = null, int $fileCount = 1): Request
    {
        $uploads = $files = [];
        for ($i = 0; $i < $fileCount; $i++) {
            $uploads[] = ['description' => 'Deposit '.$i];
            $files[] = ['file' => UploadedFile::fake()->create('deposit-'.$i.'.pdf', 10, 'application/pdf')];
        }

        return Request::create('/finance/upload-slips/bulk', 'POST', [
            'transactions' => $transactions ?? [
                ['type' => 'trip', 'id' => 1],
                ['type' => 'outside_vehicle', 'id' => 1],
                ['type' => 'rent_a_car', 'id' => 1],
            ],
            'uploads' => $uploads,
        ], [], ['uploads' => $files]);
    }

    public function test_shared_uploads_create_normal_pending_slips_for_every_transaction(): void
    {
        (new FinanceController)->uploadBulkSlips($this->request(fileCount: 2));
        $this->assertSame(6, PaymentSlip::count());
        foreach (['trip_finance_id' => 'trip_101', 'outsource_vehicle_id' => 'outsource_1', 'customer_id' => 'customer_1'] as $foreignKey => $directory) {
            $slips = PaymentSlip::where($foreignKey, 1)->orderBy('id')->get();
            $this->assertCount(2, $slips);
            foreach ($slips as $index => $slip) {
                $this->assertSame('pending', $slip->status);
                $this->assertSame(12, $slip->uploaded_by);
                $this->assertSame('Deposit '.$index, $slip->slip_des);
                $this->assertStringStartsWith('payment_slips/'.$directory.'/', $slip->slip_path);
                Storage::disk('public')->assertExists($slip->slip_path);
            }
        }
    }

    public function test_approved_slips_block_the_whole_batch_before_any_file_is_saved(): void
    {
        PaymentSlip::create(['customer_id' => 1, 'slip_path' => 'old.pdf', 'status' => 'completed']);
        try {
            (new FinanceController)->uploadBulkSlips($this->request());
            $this->fail('Approved slips must block uploads.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('transactions', $exception->errors());
        }
        $this->assertSame(1, PaymentSlip::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_duplicate_targets_are_rejected_without_saving(): void
    {
        $this->expectException(ValidationException::class);
        (new FinanceController)->uploadBulkSlips($this->request([
            ['type' => 'trip', 'id' => 1], ['type' => 'trip', 'id' => 1],
        ]));
    }

    public function test_missing_target_does_not_partially_save(): void
    {
        try {
            (new FinanceController)->uploadBulkSlips($this->request([
                ['type' => 'trip', 'id' => 1], ['type' => 'rent_a_car', 'id' => 999],
            ]));
            $this->fail('Missing targets must block uploads.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('transactions', $exception->errors());
        }
        $this->assertSame(0, PaymentSlip::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_failure_rolls_back_rows_and_removes_stored_files(): void
    {
        Event::listen('eloquent.creating: '.PaymentSlip::class, function (PaymentSlip $slip) {
            if ($slip->outsource_vehicle_id) {
                throw new \RuntimeException('Simulated save failure');
            }
        });
        try {
            (new FinanceController)->uploadBulkSlips($this->request());
            $this->fail('Expected a save failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Simulated save failure', $exception->getMessage());
        }
        $this->assertSame(0, PaymentSlip::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_existing_single_transaction_uploads_still_save_the_same_way(): void
    {
        $controller = new FinanceController;
        $controller->uploadSlips($this->request(), TripFinance::findOrFail(1));
        $controller->uploadOutsourceSlips($this->request(), OutsourceVehicle::findOrFail(1));
        $controller->uploadCustomerSlips($this->request(), Customer::findOrFail(1));
        $this->assertSame(3, PaymentSlip::where('status', 'pending')->count());
        $this->assertCount(3, Storage::disk('public')->allFiles());
    }
}
