<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Middleware\AuthenticateAttendanceApi;
use Illuminate\Support\Facades\Route;

Route::get('/attendance', [AttendanceController::class, 'index'])
    ->middleware(AuthenticateAttendanceApi::class)
    ->name('api.attendance.index');
