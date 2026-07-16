<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$driver = \App\Models\Driver::with('vehicle', 'trips')->where('registration_number', 'DRV-001')->orWhere('registration_number', 'drv-001')->first();

if (!$driver) {
    echo "Driver DRV-001 not found.\n";
} else {
    echo "Driver: " . $driver->registration_number . "\n";
    echo "Duty Status: " . $driver->duty_status . "\n";
    echo "Has Vehicle: " . ($driver->vehicle ? 'Yes (' . $driver->vehicle->id . ')' : 'No') . "\n";
    echo "Ongoing Trips: " . $driver->trips()->where('status', '!=', 'Completed')->count() . "\n";
}
