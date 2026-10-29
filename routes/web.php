<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\DriverController;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\UserLoginLog;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\CustomerSurveyController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\ReportsHubController;
use App\Http\Controllers\CustomerSurveyAdminController;
use App\Http\Controllers\PricingDataController;
use App\Http\Controllers\AccountantController;
use App\Http\Controllers\AgentDriverInsightsController;
use App\Http\Controllers\CustomerChatController;
use App\Http\Controllers\CustomerInquiryController;
use App\Http\Controllers\AttendanceController;

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
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::post('/roles/sync-permissions', [RoleController::class, 'syncPermissions'])->name('roles.sync-permissions');
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
            
        'pendingAttendanceRequests' => DB::table('agent_checkin_requests')
            ->where('status', 'pending')
            ->leftJoin('users', 'users.id', '=', 'agent_checkin_requests.user_id')
            ->select('agent_checkin_requests.*', 'users.name as user_name')
            ->orderBy('requested_at', 'desc')
            ->get(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/dashboard/attendance-requests/{id}/approve', function(Request $request, $id) {
        DB::table('agent_checkin_requests')->where('id', $id)->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);
        return redirect()->back()->with('success', 'Request approved.');
    })->name('attendance-requests.approve');

    Route::post('/finance/petty-cash-requests/{id}/approve', [FinanceController::class, 'approvePettyCashRequest'])->name('finance.petty-cash.approve');
    Route::post('/finance/petty-cash-requests', [FinanceController::class, 'storePettyCashRequest'])->name('finance.petty-cash.store');

    Route::post('/dashboard/attendance-requests/{id}/reject', function(Request $request, $id) {
        DB::table('agent_checkin_requests')->where('id', $id)->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);
        return redirect()->back()->with('success', 'Request rejected.');
    })->name('attendance-requests.reject');
});

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
    Route::get('/agent-driver-insights', [AgentDriverInsightsController::class, 'index'])->name('agent-driver-insights.index');
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/counter', [CounterController::class, 'index'])->name('counter.index');
    Route::post('/counter/new-booking', [CounterController::class, 'newBooking'])->name('counter.new-booking');
    Route::post('/counter/checkout', [CounterController::class, 'checkout'])->name('counter.checkout');
    Route::post('/counter/reorder-session', [CounterController::class, 'reorderSession'])->name('counter.reorder-session');
    Route::post('/counter/lock-customer', [CounterController::class, 'lockCustomer'])->name('counter.lock-customer');
    Route::post('/counter/unlock-customer', [CounterController::class, 'unlockCustomer'])->name('counter.unlock-customer');
    Route::get('/counter/converter', [CounterController::class, 'converter'])->name('counter.converter');
    Route::get('/counter/queue-version', [CounterController::class, 'getQueueVersion'])->name('counter.queue-version');
    Route::get('/counter/vehicles-queue', [CounterController::class, 'getVehiclesQueue'])->name('counter.vehicles-queue');
    Route::get('/counter/fms-vehicle-lookup', [CounterController::class, 'lookupFmsVehicle'])->name('counter.fms-vehicle-lookup');
    Route::get('/manager-reports', [\App\Http\Controllers\ManagerReportController::class, 'index'])->name('manager-reports.index');
    Route::get('/manager-reports/trips/print', [\App\Http\Controllers\ManagerReportController::class, 'printTrips'])->name('manager-reports.trips-print');
    Route::get('/manager-reports/trips/pdf', [\App\Http\Controllers\ManagerReportController::class, 'pdfTrips'])->name('manager-reports.trips-pdf');
});

Route::get('/checkout-summary/{userLoginLog}', [CounterController::class, 'checkoutSummary'])->name('counter.checkout-summary');
Route::post('/checkout-summary/{userLoginLog}/handover', [CounterController::class, 'handover'])->name('counter.handover');
Route::get('/checkout-summary/{userLoginLog}/pdf', [CounterController::class, 'downloadPdf'])->name('counter.checkout-pdf');

Route::post('/customers/{customer}/payment', [CustomerController::class, 'savePayment'])
    ->name('customers.payment');

Route::get('/customers/{customer}/invoice/pdf', [CustomerController::class, 'downloadInvoice'])
    ->name('customers.invoice.pdf');

Route::post('/customers/{customer}/assign-trip', [CustomerController::class, 'assignTrip'])
    ->name('customers.assign-trip');

Route::post('/customers/{customer}/assign-external-vehicle', [CustomerController::class, 'assignExternalVehicle'])
    ->name('customers.assign-external-vehicle');

Route::post('/customers/{customer}/assign-outsource-vehicle', [CustomerController::class, 'assignOutsourceVehicle'])
    ->name('customers.assign-outsource-vehicle');

Route::get('/trips', [TripController::class, 'index'])
    ->name('trips.index');

Route::get('/trips/{trip}/invoice', [TripController::class, 'downloadInvoice'])
    ->name('trips.invoice');
Route::get('/trips/{trip}/invoice/pdf', [TripController::class, 'downloadInvoice']);

Route::get('/trips/outsource/{outsourceVehicle}/invoice', [TripController::class, 'downloadOutsourceInvoice'])
    ->name('trips.outsource-invoice');
Route::get('/trips/outsource/{outsourceVehicle}/invoice/pdf', [TripController::class, 'downloadOutsourceInvoice']);

Route::post('/trips/{trip}/check-in', [TripController::class, 'checkIn'])
    ->name('trips.check-in');

Route::get('/short-trips', [TripController::class, 'shortTripsIndex'])
    ->name('short-trips.index');

Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
Route::post('/finance/rates', [FinanceController::class, 'storeRateSettings'])->name('finance.rates.store');
Route::post('/finance/payouts/store', [FinanceController::class, 'storePayout'])->name('finance.payouts.store');
Route::post('/finance/incentives/store', [FinanceController::class, 'storeIncentive'])->name('finance.incentives.store');
Route::put('/finance/incentives/{incentive}', [FinanceController::class, 'updateIncentive'])->name('finance.incentives.update');
Route::delete('/finance/incentives/{incentive}', [FinanceController::class, 'destroyIncentive'])->name('finance.incentives.destroy');
Route::post('/finance/drivers/{driver}/payment', [FinanceController::class, 'updateDriverPayment'])->name('finance.drivers.payment');
Route::post('/finance/drivers/{driver}/status', [FinanceController::class, 'updateDriverStatus'])->name('finance.drivers.status');
Route::post('/finance/trip-finances/{trip}/mark-received', [FinanceController::class, 'markReceived'])->name('finance.trip-finances.mark-received');
Route::post('/finance/outsource-vehicles/{outsourceVehicle}/mark-received', [FinanceController::class, 'markOutsourceReceived'])->name('finance.outsource-vehicles.mark-received');
Route::post('/finance/customers/{customer}/mark-received', [FinanceController::class, 'markCustomerReceived'])->name('finance.customers.mark-received');
Route::post('/finance/trip-finances/{tripFinance}/upload-slips', [FinanceController::class, 'uploadSlips'])->name('finance.trip-finances.upload-slips');
Route::post('/finance/outsource-vehicles/{outsourceVehicle}/upload-slips', [FinanceController::class, 'uploadOutsourceSlips'])->name('finance.outsource-vehicles.upload-slips');
Route::post('/finance/customers/{customer}/upload-slips', [FinanceController::class, 'uploadCustomerSlips'])->name('finance.customers.upload-slips');
Route::post('/finance/expenses', [FinanceController::class, 'storeExpense'])->name('finance.expenses.store');
Route::put('/finance/expenses/{expense}', [FinanceController::class, 'updateExpense'])->name('finance.expenses.update');
Route::delete('/finance/expenses/{expense}', [FinanceController::class, 'destroyExpense'])->name('finance.expenses.destroy');
Route::get('/finance/export', [FinanceController::class, 'exportProfitLoss'])->name('finance.export');
Route::post('/finance/rent-a-car-rates', [FinanceController::class, 'storeRentACarRate'])->name('finance.rent-a-car-rates.store');
Route::match(['put', 'patch', 'post'], '/finance/rent-a-car-rates/category-bulk-update', [FinanceController::class, 'bulkUpdateCategoryRate'])->name('finance.rent-a-car-rates.bulk-update');
Route::match(['put', 'patch', 'post'], '/finance/rent-a-car-rates/{id}', [FinanceController::class, 'updateRentACarRate'])->name('finance.rent-a-car-rates.update');
Route::delete('/finance/rent-a-car-rates/{id}', [FinanceController::class, 'destroyRentACarRate'])->name('finance.rent-a-car-rates.destroy');
Route::post('/finance/{trip}', [FinanceController::class, 'store'])->name('finance.store');

Route::get('/survey/{trip}', [CustomerSurveyController::class, 'show'])
    ->name('survey.show');

Route::post('/survey/{trip}', [CustomerSurveyController::class, 'store'])
    ->name('survey.store');

// Public Customer QR Customer Portal (WhatsApp Chat UI by Agent ID e.g. /customerPortal/AGNT-1)
Route::get('/customerPortal/{agentId?}', [CustomerInquiryController::class, 'show'])
    ->name('customer-portal.portal');
Route::get('/customer-portal/{agentId?}', [CustomerInquiryController::class, 'show'])
    ->name('customer-portal.show');
Route::post('/customer-portal/send-message', [CustomerInquiryController::class, 'sendMessage'])
    ->name('customer-portal.send-message');
Route::post('/customerPortal/send-message', [CustomerInquiryController::class, 'sendMessage']);
Route::get('/customer-portal/messages/{agentId}/{chatId?}', [CustomerInquiryController::class, 'getMessages'])
    ->name('customer-portal.messages');
Route::get('/customerPortal/messages/{agentId}/{chatId?}', [CustomerInquiryController::class, 'getMessages']);

// Backward compatibility redirect from /inquiry to /customer-portal
Route::redirect('/inquiry', '/customer-portal', 301);

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
    Route::get('/accountant', [AccountantController::class, 'index'])->name('accountant.index');
    Route::post('/accountant/approve/{tripFinance}', [AccountantController::class, 'approve'])->name('accountant.approve');
    Route::post('/accountant/approve-outsource/{outsourceVehicle}', [AccountantController::class, 'approveOutsource'])->name('accountant.approve-outsource');
    Route::post('/accountant/approve-customer/{customer}', [AccountantController::class, 'approveCustomer'])->name('accountant.approve-customer');
    Route::post('/accountant/slips/{slip}/status', [AccountantController::class, 'updateSlipStatus'])->name('accountant.slips.status');
    Route::post('/accountant/trip-finances/{tripFinance}/slips/status', [AccountantController::class, 'updateAllSlipsStatus'])->name('accountant.trip-finances.slips.status');
    Route::post('/accountant/outsource-vehicles/{outsourceVehicle}/slips/status', [AccountantController::class, 'updateAllOutsourceSlipsStatus'])->name('accountant.outsource-vehicles.slips.status');
    Route::post('/accountant/customers/{customer}/slips/status', [AccountantController::class, 'updateAllCustomerSlipsStatus'])->name('accountant.customers.slips.status');
    
    // Customer Chats routes
    Route::get('/chats', [CustomerChatController::class, 'index'])->name('chats.index');
    Route::get('/chats/{chat}/messages', [CustomerChatController::class, 'messages'])->name('chats.messages');
    Route::post('/chats/{chat}/messages', [CustomerChatController::class, 'storeMessage'])->name('chats.messages.store');
    Route::patch('/chats/{chat}/status', [CustomerChatController::class, 'updateStatus'])->name('chats.update-status');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pricing-data', [PricingDataController::class, 'index'])->name('pricing-data.index');
    Route::post('/pricing-data/import', [PricingDataController::class, 'import'])->name('pricing-data.import');
    Route::get('/dss', [CounterController::class, 'dssIndex'])->name('dcss.index');
    Route::get('/admin', [\App\Http\Controllers\Admin\AdminActivityController::class, 'index'])->name('admin.index');
    Route::get('/admin/activity', [\App\Http\Controllers\Admin\AdminActivityController::class, 'index'])->name('admin.activity');
    Route::get('/admin/export', [\App\Http\Controllers\Admin\AdminActivityController::class, 'export'])->name('admin.export');
    Route::post('/admin/verify-password', [\App\Http\Controllers\Admin\AdminActivityController::class, 'verifyPassword'])->name('admin.verify-password');
    Route::post('/admin/lock', [\App\Http\Controllers\Admin\AdminActivityController::class, 'lock'])->name('admin.lock');
    Route::post('/admin/audit/log-client-export', [\App\Http\Controllers\Admin\AdminActivityController::class, 'logClientExport'])->name('admin.audit.log-client-export');
});

// ── Reports Hub ────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('reports-hub')->group(function () {
    Route::get('/', [ReportsHubController::class, 'index'])->name('reports-hub.index');
    Route::get('/data/trips',    [ReportsHubController::class, 'trips'])->name('reports-hub.trips');
    Route::get('/data/revenue',  [ReportsHubController::class, 'revenue'])->name('reports-hub.revenue');
    Route::get('/data/drivers',  [ReportsHubController::class, 'drivers'])->name('reports-hub.drivers');
    Route::get('/data/customers',[ReportsHubController::class, 'customers'])->name('reports-hub.customers');
    Route::get('/data/finance',  [ReportsHubController::class, 'finance'])->name('reports-hub.finance');
    Route::get('/data/sessions', [ReportsHubController::class, 'sessions'])->name('reports-hub.sessions');
    Route::get('/data/surveys',  [ReportsHubController::class, 'surveys'])->name('reports-hub.surveys');
    Route::get('/data/manager',  [ReportsHubController::class, 'manager'])->name('reports-hub.manager');
});

require __DIR__.'/auth.php';
