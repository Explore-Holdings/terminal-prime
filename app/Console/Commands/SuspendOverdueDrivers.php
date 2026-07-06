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
        Driver::whereDate('due_date', '<', Carbon::today())
            ->where('payment_received', false)
            ->where('driver_status', '!=', 'Suspended')
            ->update([
                'driver_status' => 'Suspended'
            ]);

        $this->info('Overdue drivers suspended successfully.');
    }
}