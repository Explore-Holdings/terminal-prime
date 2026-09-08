<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PricingDataController extends Controller
{
    private const TABLES = [
        'location_vehicle_prices' => [
            'label' => 'Location Vehicle Prices',
            'headers' => ['city', 'sedan', 'suv', 'van', 'luxury_sedan'],
            'key' => 'city',
            'numeric' => ['sedan', 'suv', 'van', 'luxury_sedan'],
        ],
        'counter_selling_rate' => [
            'label' => 'Counter Selling Rates',
            'headers' => ['city_name', 'final_rate'],
            'key' => 'city_name',
            'numeric' => ['final_rate'],
        ],
        'vehicle_rates' => [
            'label' => 'Vehicle Rates',
            'headers' => ['vehicle_type', 'rate'],
            'key' => 'vehicle_type',
            'numeric' => ['rate'],
        ],
    ];

    public function index()
    {
        return Inertia::render('PricingData/Index', [
            'tables' => collect(self::TABLES)->map(fn ($table, $name) => [
                'name' => $name,
                'label' => $table['label'],
                'headers' => $table['headers'],
            ])->values(),
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'table' => ['required', 'in:' . implode(',', array_keys(self::TABLES))],
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $tableName = $request->string('table')->toString();
        $config = self::TABLES[$tableName];
        $handle = fopen($request->file('file')->getRealPath(), 'rb');

        if ($handle === false) {
            return back()->withErrors(['file' => 'The CSV file could not be opened.']);
        }

        $headers = fgetcsv($handle);
        $headers = $headers === false
            ? []
            : array_map(fn ($header) => strtolower(trim((string) $header)), $headers);

        if ($headers !== $config['headers']) {
            fclose($handle);
            return back()->withErrors([
                'file' => 'Invalid CSV headers. Expected: ' . implode(', ', $config['headers']) . '.',
            ]);
        }

        $rows = [];
        $line = 1;
        while (($values = fgetcsv($handle)) !== false) {
            $line++;
            if (count($values) === 1 && trim((string) $values[0]) === '') {
                continue;
            }

            if (count($values) !== count($headers)) {
                fclose($handle);
                return back()->withErrors(['file' => "Invalid column count on CSV line {$line}."]);
            }

            $row = array_combine($headers, array_map(fn ($value) => trim((string) $value), $values));
            $validator = Validator::make($row, array_merge(
                [$config['key'] => ['required', 'string', 'max:255']],
                array_fill_keys($config['numeric'], ['required', 'numeric', 'min:0'])
            ));

            if ($validator->fails()) {
                fclose($handle);
                return back()->withErrors([
                    'file' => "Invalid data on CSV line {$line}: " . $validator->errors()->first(),
                ]);
            }

            $rows[] = $row;
        }
        fclose($handle);

        if (!$rows) {
            return back()->withErrors(['file' => 'The CSV file does not contain any data rows.']);
        }

        DB::transaction(function () use ($tableName, $config, $rows) {
            DB::table($tableName)->delete();
            $nextId = 1;

            foreach ($rows as $row) {
                DB::table($tableName)->insert(array_merge(
                    ['id' => $nextId++],
                    $row
                ));
            }
        });

        return back()->with('success', count($rows) . ' pricing row(s) imported successfully.');
    }
}
