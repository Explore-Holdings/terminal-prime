<?php

namespace App\Http\Controllers;

use App\Models\CustomerSurvey;
use Inertia\Inertia;

class CustomerSurveyAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('CustomerSurveys/Index', [
            'surveys' => CustomerSurvey::with([
                'trip',
                'customer',
                'driver',
            ])->latest()->get(),
        ]);
    }
}