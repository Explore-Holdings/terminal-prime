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

        // Ensure user_login_logs table has rich device & location columns in MySQL
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('user_login_logs')) {
                $existingCols = \Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM `user_login_logs`");
                $colNames = array_map(function ($col) {
                    $arr = (array) $col;
                    return $arr['Field'] ?? $arr['field'] ?? '';
                }, $existingCols);

                $missing = [];
                if (!in_array('device_id', $colNames)) {
                    $missing[] = "ADD COLUMN `device_id` VARCHAR(64) NULL AFTER `shift_id`";
                }
                if (!in_array('device_type', $colNames)) {
                    $missing[] = "ADD COLUMN `device_type` VARCHAR(50) NULL AFTER `user_agent`";
                }
                if (!in_array('device_name', $colNames)) {
                    $missing[] = "ADD COLUMN `device_name` VARCHAR(100) NULL AFTER `device_type`";
                }
                if (!in_array('operating_system', $colNames)) {
                    $missing[] = "ADD COLUMN `operating_system` VARCHAR(100) NULL AFTER `device_name`";
                }
                if (!in_array('browser', $colNames)) {
                    $missing[] = "ADD COLUMN `browser` VARCHAR(100) NULL AFTER `operating_system`";
                }
                if (!in_array('city', $colNames)) {
                    $missing[] = "ADD COLUMN `city` VARCHAR(100) NULL AFTER `browser`";
                }
                if (!in_array('region', $colNames)) {
                    $missing[] = "ADD COLUMN `region` VARCHAR(100) NULL AFTER `city`";
                }
                if (!in_array('country', $colNames)) {
                    $missing[] = "ADD COLUMN `country` VARCHAR(100) NULL AFTER `region`";
                }
                if (!in_array('country_code', $colNames)) {
                    $missing[] = "ADD COLUMN `country_code` VARCHAR(10) NULL AFTER `country`";
                }
                if (!in_array('location', $colNames)) {
                    $missing[] = "ADD COLUMN `location` VARCHAR(255) NULL AFTER `country_code`";
                }
                if (!in_array('status', $colNames)) {
                    $missing[] = "ADD COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'active' AFTER `location`";
                }

                if (!empty($missing)) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE `user_login_logs` " . implode(', ', $missing));
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Auto-migration for user_login_logs failed: ' . $e->getMessage());
        }

        Event::listen(Login::class, function (Login $event) {
            $ip = request()->ip();
            $ua = request()->userAgent();

            $deviceId = request('device_id')
                ?: request()->header('X-Device-Id')
                ?: request()->cookie('terminal_device_id')
                ?: null;

            $deviceInfo = DeviceDetector::detect($ua);
            $geoInfo = GeoLocationService::locate($ip);

            $event->user->loadMissing('role');
            $roleName = strtolower($event->user->role?->name ?? '');
            $isCounterStaff = $roleName === 'counter staff';

            try {
                $log = UserLoginLog::create([
                    'user_id'          => $event->user->id,
                    'device_id'        => $deviceId,
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

                if ($isCounterStaff) {
                    $log->update(['shift_id' => 'SHIFT-' . str_pad($log->id, 2, '0', STR_PAD_LEFT)]);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('UserLoginLog creation failed on login: ' . $e->getMessage());
                // Fallback creation with basic attributes if new columns are not yet in the DB
                try {
                    $fallbackLog = UserLoginLog::create([
                        'user_id'    => $event->user->id,
                        'ip_address' => $ip,
                        'user_agent' => $ua,
                        'login_at'   => now(),
                    ]);
                    if ($isCounterStaff) {
                        $fallbackLog->update(['shift_id' => 'SHIFT-' . str_pad($fallbackLog->id, 2, '0', STR_PAD_LEFT)]);
                    }
                } catch (\Throwable $ex) {
                    \Illuminate\Support\Facades\Log::error('Fallback UserLoginLog creation failed: ' . $ex->getMessage());
                }
            }
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
