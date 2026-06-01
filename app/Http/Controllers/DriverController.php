<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index()
    {
        return Inertia::render('Drivers/Index', [
            'drivers' => Driver::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Drivers/Create', [
            'serviceCategories' => ServiceCategory::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:100',
            'nic' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        Driver::create($data);

        return redirect()->route('drivers.index')
            ->with('success', 'Driver created successfully.');
    }
}