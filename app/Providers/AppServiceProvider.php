<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Models\UserLoginLog;
use App\Models\Trip;
use App\Observers\TripObserver;
use App\Services\DeviceDetector;
use App\Services\GeoLocationService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register the Trip observer for session tracking
        Trip::observe(TripObserver::class);

        // Ensure user_login_logs table has rich device & location columns
        try {
            if (Schema::hasTable('user_login_logs') && !Schema::hasColumn('user_login_logs', 'device_type')) {
                Schema::table('user_login_logs', function (Blueprint $table) {
                    if (!Schema::hasColumn('user_login_logs', 'device_type')) {
                        $table->string('device_type', 50)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'device_name')) {
                        $table->string('device_name', 100)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'operating_system')) {
                        $table->string('operating_system', 100)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'browser')) {
                        $table->string('browser', 100)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'city')) {
                        $table->string('city', 100)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'region')) {
                        $table->string('region', 100)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'country')) {
                        $table->string('country', 100)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'country_code')) {
                        $table->string('country_code', 10)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'location')) {
                        $table->string('location', 255)->nullable();
                    }
                    if (!Schema::hasColumn('user_login_logs', 'status')) {
                        $table->string('status', 30)->default('active');
                    }
                });
            }
        } catch (\Throwable $e) {
            // Silently ignore if already migrated or during CLI setup
        }

        Event::listen(Login::class, function (Login $event) {
            $ip = request()->ip();
            $ua = request()->userAgent();

            $deviceInfo = DeviceDetector::detect($ua);
            $geoInfo = GeoLocationService::locate($ip);

            $log = UserLoginLog::create([
                'user_id'          => $event->user->id,
                'ip_address'       => $ip,
                'user_agent'       => $ua,
                'device_type'      => $deviceInfo['device_type'] ?? 'Desktop',
                'device_name'      => $deviceInfo['device_name'] ?? 'Unknown Device',
                'operating_system' => $deviceInfo['operating_system'] ?? 'Unknown OS',
                'browser'          => $deviceInfo['browser'] ?? 'Browser',
                'city'             => $geoInfo['city'] ?? null,
                'region'           => $geoInfo['region'] ?? null,
                'country'          => $geoInfo['country'] ?? null,
                'country_code'     => $geoInfo['country_code'] ?? null,
                'location'         => $geoInfo['location'] ?? 'Unknown Location',
                'status'           => 'active',
                'login_at'         => now(),
            ]);
            $log->update(['shift_id' => 'SHIFT-' . str_pad($log->id, 2, '0', STR_PAD_LEFT)]);
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user) {
                UserLoginLog::where('user_id', $event->user->id)
                    ->whereNull('logout_at')
                    ->latest('login_at')
                    ->first()
                    ?->update([
                        'logout_at' => now(),
                        'status'    => 'logged_out',
                    ]);
            }
        });
    }
}
