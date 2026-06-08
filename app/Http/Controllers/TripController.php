<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index()
    {
        return Inertia::render('Trips/Index', [
            'trips' => Trip::with([
                'driver',
                'customer',
                'agent.user',
            ])
            ->latest()
            ->get(),
        ]);
    }
}