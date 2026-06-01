<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ServiceCategory;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        $categories = [
            'Airport Transfers',
            'Hotel Transfers',
            'Point-to-Point Transfers',
            'Corporate Transfers',
            'City Tours',
            'Day Tours',
            'Multi-Day Tours',
            'Chauffeur Services',
            'VIP Transfers',
            'Cruise Passenger Transfers',
        ];

        foreach ($categories as $category) {
            ServiceCategory::firstOrCreate([
                'name' => $category,
            ]);
        }
    }
}
