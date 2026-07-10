<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Driver;
use Carbon\Carbon;

class SuspendOverdueDrivers extends Command
{
    protected $signature = 'drivers:suspend-overdue';
    protected $description = 'Suspend drivers whose payment is overdue';

    public function handle()
    {
        Driver::all()->each(function ($driver) {
            if ($driver->payment_received) {
                $driver->update([
                    'driver_status' => 'Active',
                ]);
            } elseif (
                $driver->due_date &&
                now()->gt(\Carbon\Carbon::parse($driver->due_date))
            ) {
                $driver->update([
                    'driver_status' => 'Suspended',
                ]);
            }
        });

        $this->info('Overdue drivers suspended successfully.');
    }
}