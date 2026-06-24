<?php

use App\Http\Controllers\Api\Reports\DashboardController;
use App\Http\Controllers\Api\Reports\RecentTripsController;
use App\Http\Controllers\Api\Reports\RevenueChartController;
use App\Http\Controllers\Api\Reports\TopDestinationsController;
use App\Http\Controllers\Api\Reports\TripStatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('reports')->group(function () {
    Route::get('/dashboard',        [DashboardController::class,      'index']);
    Route::get('/revenue-chart',    [RevenueChartController::class,   'index']);
    Route::get('/trip-status',      [TripStatusController::class,     'index']);
    Route::get('/top-destinations', [TopDestinationsController::class,'index']);
    Route::get('/recent-trips',     [RecentTripsController::class,    'index']);
});
