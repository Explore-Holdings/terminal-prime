<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DriverController;
use App\Models\Driver;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CounterController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('users', UserController::class);
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'stats' => [
            'totalDrivers' => Driver::count(),
            'activeDrivers' => Driver::where('driver_status', 'Active')->count(),
            'pendingApproval' => Driver::where('registration_status', 'Pending')->count(),
            'suspendedDrivers' => Driver::where('driver_status', 'Suspended')->count(),
        ],

        'recentDrivers' => Driver::latest()
            ->take(5)
            ->get([
                'id',
                'registration_number',
                'full_name',
                'mobile_number',
                'driver_status',
                'registration_status',
                'created_at',
            ]),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::resource('drivers', DriverController::class)->only([
    'index', 'create', 'store'
]);

Route::get('/drivers/{driver}', [DriverController::class, 'show'])
    ->name('drivers.show');

Route::get('/drivers/{driver}/edit', [DriverController::class, 'edit'])
    ->name('drivers.edit');

Route::put('/drivers/{driver}', [DriverController::class, 'update'])
    ->name('drivers.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('customers', CustomerController::class);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/counter', [CounterController::class, 'index'])->name('counter.index');
});

Route::post('/customers/{customer}/payment', [CustomerController::class, 'savePayment'])
    ->name('customers.payment');

require __DIR__.'/auth.php';
