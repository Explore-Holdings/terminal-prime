<?php

namespace App\Http\Controllers;

use App\Models\CustomerSurvey;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerSurveyController extends Controller
{
    public function show(Trip $trip)
    {
        $trip->load(['customer', 'driver']);

        $alreadySubmitted = CustomerSurvey::where('trip_id', $trip->id)->exists();

        return Inertia::render('Survey/Show', [
            'trip' => $trip,
            'alreadySubmitted' => $alreadySubmitted,
        ]);
    }

    public function store(Request $request, Trip $trip)
    {
        if (CustomerSurvey::where('trip_id', $trip->id)->exists()) {
            return redirect()
                ->route('survey.show', $trip->id)
                ->with('error', 'Survey already submitted.');
        }

        $data = $request->validate([
            'journey_rating' => 'required|integer|min:1|max:5',
            'driver_rating' => 'nullable|integer|min:1|max:5',
            'driver_charged_extra' => 'required|boolean',
            'extra_amount' => 'nullable|required_if:driver_charged_extra,1|string|max:255',
            'driver_was_polite' => 'required|boolean',
            'vehicle_was_clean' => 'required|boolean',
            'felt_safe' => 'required|boolean',
            'comments' => 'nullable|string|max:1000',
        ]);

        CustomerSurvey::create([
            ...$data,
            'trip_id' => $trip->id,
            'customer_id' => $trip->customer_id,
            'driver_id' => $trip->driver_id,
        ]);

        return redirect()
            ->route('survey.show', $trip->id)
            ->with('success', 'Thank you for your feedback.');
    }
}