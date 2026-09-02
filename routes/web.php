<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DriverController;
use App\Models\Customer;
use App\Models\Driver;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\CustomerSurveyController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\CustomerSurveyAdminController;

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
            'totalCustomers' => Customer::count(),
            'activeDrivers' => Driver::where('driver_status', 'Active')->count(),
            'pendingApproval' => Driver::where('registration_status', 'Pending')->count(),
            'suspendedDrivers' => Driver::where('driver_status', 'Suspended')->count(),
        ],

        'recentDrivers' => Driver::latest()
            ->take(5)
            ->get([
                'id',
                'registration_number',
                'first_name',
                'last_name',
                'mobile_number',
                'driver_status',
                'registration_status',
                'created_at',
            ]),

        'recentCustomers' => Customer::latest()
            ->take(5)
            ->get([
                'id',
                'name',
                'whatsapp_number',
                'status',
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
    Route::post('/counter/checkout', [CounterController::class, 'checkout'])->name('counter.checkout');
    Route::post('/counter/reorder-session', [CounterController::class, 'reorderSession'])->name('counter.reorder-session');
    Route::post('/counter/lock-customer', [CounterController::class, 'lockCustomer'])->name('counter.lock-customer');
    Route::post('/counter/unlock-customer', [CounterController::class, 'unlockCustomer'])->name('counter.unlock-customer');
    Route::get('/manager-reports', [\App\Http\Controllers\ManagerReportController::class, 'index'])->name('manager-reports.index');
    Route::get('/manager-reports/trips/print', [\App\Http\Controllers\ManagerReportController::class, 'printTrips'])->name('manager-reports.trips-print');
    Route::get('/manager-reports/trips/pdf', [\App\Http\Controllers\ManagerReportController::class, 'pdfTrips'])->name('manager-reports.trips-pdf');
});

Route::get('/checkout-summary/{userLoginLog}', [CounterController::class, 'checkoutSummary'])->name('counter.checkout-summary');
Route::post('/checkout-summary/{userLoginLog}/handover', [CounterController::class, 'handover'])->name('counter.handover');
Route::get('/checkout-summary/{userLoginLog}/pdf', [CounterController::class, 'downloadPdf'])->name('counter.checkout-pdf');

Route::post('/customers/{customer}/payment', [CustomerController::class, 'savePayment'])
    ->name('customers.payment');

Route::post('/customers/{customer}/assign-trip', [CustomerController::class, 'assignTrip'])
    ->name('customers.assign-trip');

Route::post('/customers/{customer}/assign-external-vehicle', [CustomerController::class, 'assignExternalVehicle'])
    ->name('customers.assign-external-vehicle');

Route::get('/trips', [TripController::class, 'index'])
    ->name('trips.index');

Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
Route::post('/finance/rates', [FinanceController::class, 'storeRateSettings'])->name('finance.rates.store');
Route::post('/finance/payouts/store', [FinanceController::class, 'storePayout'])->name('finance.payouts.store');
Route::post('/finance/incentives/store', [FinanceController::class, 'storeIncentive'])->name('finance.incentives.store');
Route::put('/finance/incentives/{incentive}', [FinanceController::class, 'updateIncentive'])->name('finance.incentives.update');
Route::delete('/finance/incentives/{incentive}', [FinanceController::class, 'destroyIncentive'])->name('finance.incentives.destroy');
Route::post('/finance/drivers/{driver}/payment', [FinanceController::class, 'updateDriverPayment'])->name('finance.drivers.payment');
Route::post('/finance/drivers/{driver}/status', [FinanceController::class, 'updateDriverStatus'])->name('finance.drivers.status');
Route::post('/finance/trip-finances/{trip}/mark-received', [FinanceController::class, 'markReceived'])->name('finance.trip-finances.mark-received');
Route::post('/finance/expenses', [FinanceController::class, 'storeExpense'])->name('finance.expenses.store');
Route::put('/finance/expenses/{expense}', [FinanceController::class, 'updateExpense'])->name('finance.expenses.update');
Route::delete('/finance/expenses/{expense}', [FinanceController::class, 'destroyExpense'])->name('finance.expenses.destroy');
Route::get('/finance/export', [FinanceController::class, 'exportProfitLoss'])->name('finance.export');
Route::post('/finance/{trip}', [FinanceController::class, 'store'])->name('finance.store');


Route::get('/survey/{trip}', [CustomerSurveyController::class, 'show'])
    ->name('survey.show');

Route::post('/survey/{trip}', [CustomerSurveyController::class, 'store'])
    ->name('survey.store');

Route::get('/customer-surveys', [CustomerSurveyAdminController::class, 'index'])
    ->name('customer-surveys.index');

Route::prefix('reports')->group(function () {
    Route::get('/', [ReportsController::class, 'index'])->name('reports.index');
    Route::get('/dashboard', [ReportsController::class, 'dashboard'])->name('reports.dashboard');
    Route::get('/recent-trips', [ReportsController::class, 'recentTrips'])->name('reports.recent-trips');
    Route::get('/revenue-chart', [ReportsController::class, 'revenueChart'])->name('reports.revenue-chart');
    Route::get('/top-destinations', [ReportsController::class, 'topDestinations'])->name('reports.top-destinations');
    Route::get('/trip-status', [ReportsController::class, 'tripStatus'])->name('reports.trip-status');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dss', [CounterController::class, 'dssIndex'])->name('dcss.index');
});

require __DIR__.'/auth.php';
