<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Models\UserLoginLog;
use App\Models\Trip;
use App\Observers\TripObserver;

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

        Event::listen(Login::class, function (Login $event) {
            $log = UserLoginLog::create([
                'user_id' => $event->user->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'login_at' => now(),
            ]);
            $log->update(['shift_id' => 'SHIFT-' . str_pad($log->id, 2, '0', STR_PAD_LEFT)]);
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user) {
                UserLoginLog::where('user_id', $event->user->id)
                    ->whereNull('logout_at')
                    ->latest('login_at')
                    ->first()
                    ?->update(['logout_at' => now()]);
            }
        });
    }
}
