<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks any mutating HTTP request (POST, PUT, PATCH, DELETE) for users
 * whose role is "executive staff".  They may only perform GET / HEAD
 * requests, giving them view-only access across the entire application.
 */
class ExecutiveStaffReadOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing('role');
            $role = strtolower($user->role?->name ?? '');

            if ($role === 'executive staff' && !$request->isMethod('GET') && !$request->isMethod('HEAD')) {
                // Allow essential auth routes (logout, password, profile)
                $allowedRoutes = ['logout', 'password.update', 'profile.update', 'profile.destroy'];
                $currentRoute = $request->route()?->getName();

                if (!in_array($currentRoute, $allowedRoutes)) {
                    if ($request->wantsJson() || $request->header('X-Inertia')) {
                        return back()->with('error', 'Executive staff members have view-only access.');
                    }

                    abort(403, 'Executive staff members have view-only access.');
                }
            }
        }

        return $next($request);
    }
}
