<?php

namespace App\Http\Controllers;
use App\Models\Driver;
use App\Models\EmergencyContact;
use App\Models\DrivingLicense;
use App\Models\Vehicle;
use App\Models\VehicleFeature;
use App\Models\VehicleDocument;
use App\Models\VehiclePicture;
use App\Models\BankDetail;
use App\Models\DriverDocument;
use App\Models\AdminVerification;
use App\Models\DriverLanguage;
use App\Models\ServiceCategory;
use App\Models\DriverAvailability;
use App\Models\TechnologyInfo;
use App\Models\TourismCompliance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

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
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'full_name' => 'required|string|max:255',
            'nic_number' => 'required|string|max:20|unique:drivers,nic_number',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string',
            'nationality' => 'required|string|max:100',
            'marital_status' => 'required|string|max:50',
            'mobile_number' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:users,email|unique:drivers,email',
            'city' => 'required|string|max:100',
            'permanent_address' => 'required|string',

            'emergency_contact_name' => 'required|string|max:255',
            'relationship' => 'required|string|max:100',
            'emergency_contact_number' => 'required|string|max:20',

            'license_type' => 'required|string|max:100',
            'license_number' => 'required|string|max:100',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'years_of_experience' => 'required|integer|min:0',

            'vehicle_registration_number' => 'required|string|max:50',
            'vehicle_type' => 'required|string',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',

            'service_category_ids' => 'required|array|min:1',
            'service_category_ids.*' => 'exists:service_categories,id',

            'driver_languages' => 'required|array|min:1',
            'driver_languages.*.language_name' => 'required|string|max:100',
            'driver_languages.*.speaking_level' => 'required|string',
            'driver_languages.*.reading_level' => 'required|string',
            'driver_languages.*.writing_level' => 'required|string',

            'driver_photo' => 'nullable|image|max:4096',
        ]);

        DB::transaction(function () use ($request) {
            $lastDriver = Driver::where('registration_number', 'REGEXP', '^DRV-[0-9]{3}$')
                ->orderByRaw("CAST(SUBSTRING(registration_number, 5) AS UNSIGNED) DESC")
                ->first();

            $nextNumber = 1;

            if ($lastDriver) {
                $lastNumber = (int) substr($lastDriver->registration_number, 4);
                $nextNumber = $lastNumber + 1;
            }

            $registrationNumber = 'DRV-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

            $driverPhoto = $this->upload(
                $request,
                'driver_photo',
                $registrationNumber,
                'profile'
            );

            $driver = Driver::create([
                'registration_number' => $registrationNumber,
                'registration_date' => now()->toDateString(),
                'registration_status' => 'Pending',

                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'full_name' => $request->full_name,
                'nic_number' => $request->nic_number,
                'passport_number' => $request->passport_number,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'marital_status' => $request->marital_status,
                'mobile_number' => $request->mobile_number,
                'whatsapp_number' => $request->whatsapp_number,
                'alternative_contact_number' => $request->alternative_contact_number,
                'email' => $request->email,
                'permanent_address' => $request->permanent_address,
                'current_address' => $request->current_address,
                'city' => $request->city,
                'driver_photo' => $driverPhoto,
                'previous_employer' => $request->previous_employer,
                'previous_tourism_experience' => $request->previous_tourism_experience,
                'accident_history' => $request->accident_history,
                'traffic_violation_history' => $request->traffic_violation_history,
                'driver_status' => $request->driver_status ?? 'Inactive',
            ]);

            EmergencyContact::create([
                'driver_id' => $driver->id,
                'contact_name' => $request->emergency_contact_name,
                'relationship' => $request->relationship,
                'contact_number' => $request->emergency_contact_number,
                'alternative_contact_number' => $request->emergency_alternative_contact_number,
                'address' => $request->emergency_address,
            ]);

            DrivingLicense::create([
                'driver_id' => $driver->id,
                'license_number' => $request->license_number,
                'license_type' => $request->license_type,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'years_of_experience' => $request->years_of_experience,
                'tourist_license_available' => $request->boolean('tourist_license_available'),
                'tourist_license_number' => $request->tourist_license_number,
                'tourist_issue_date' => $request->tourist_issue_date,
                'tourist_expiry_date' => $request->tourist_expiry_date,
            ]);

            foreach ($request->driver_languages ?? [] as $language) {
                DriverLanguage::create([
                    'driver_id' => $driver->id,
                    'language_name' => $language['language_name'],
                    'speaking_level' => $language['speaking_level'],
                    'reading_level' => $language['reading_level'],
                    'writing_level' => $language['writing_level'],
                ]);
            }

            $driver->serviceCategories()->sync($request->service_category_ids ?? []);

            DriverAvailability::create([
                'driver_id' => $driver->id,
                'monday' => $request->boolean('monday'),
                'tuesday' => $request->boolean('tuesday'),
                'wednesday' => $request->boolean('wednesday'),
                'thursday' => $request->boolean('thursday'),
                'friday' => $request->boolean('friday'),
                'saturday' => $request->boolean('saturday'),
                'sunday' => $request->boolean('sunday'),
                'working_shift' => $request->working_shift,
                'airport_pickups' => $request->boolean('airport_pickups'),
                'airport_dropoffs' => $request->boolean('airport_dropoffs'),
                'tours' => $request->boolean('tours'),
                'long_distance_travel' => $request->boolean('long_distance_travel'),
                'overnight_tours' => $request->boolean('overnight_tours'),
            ]);

            TechnologyInfo::create([
                'driver_id' => $driver->id,
                'smartphone_available' => $request->boolean('smartphone_available'),
                'device_type' => $request->device_type,
                'internet_connection_available' => $request->boolean('internet_connection_available'),
                'gps_tracking_enabled' => $request->boolean('gps_tracking_enabled'),
                'mobile_app_usage_experience' => $request->boolean('mobile_app_usage_experience'),
            ]);

            TourismCompliance::create([
                'driver_id' => $driver->id,
                'tourism_registration_number' => $request->tourism_registration_number,
                'sltda_registered_driver' => $request->boolean('sltda_registered_driver'),
                'tourist_driving_license_copy' => $this->upload($request, 'tourist_driving_license_copy_file', $registrationNumber, 'tourism'),
                'tourism_authority_permit_copy' => $this->upload($request, 'tourism_authority_permit_copy', $registrationNumber, 'tourism'),
                'airport_access_permit' => $this->upload($request, 'airport_access_permit', $registrationNumber, 'tourism'),
            ]);

            $vehicle = Vehicle::create([
                'driver_id' => $driver->id,
                'registration_number' => $request->vehicle_registration_number,
                'vehicle_type' => $request->vehicle_type,
                'brand' => $request->brand,
                'model' => $request->model,
                'vehicle_year' => $request->vehicle_year,
                'color' => $request->color,
                'seating_capacity' => $request->seating_capacity,
                'luggage_capacity' => $request->luggage_capacity,
                'fuel_type' => $request->fuel_type,
                'transmission_type' => $request->transmission_type,
                'ownership_type' => $request->ownership_type,
                'ownership_confirmation_letter' => $this->upload($request, 'ownership_confirmation_letter', $registrationNumber, 'ownership'),            
            ]);

            VehicleFeature::create([
                'vehicle_id' => $vehicle->id,
                'air_conditioned' => $request->boolean('air_conditioned'),
                'wifi_available' => $request->boolean('wifi_available'),
                'gps_enabled' => $request->boolean('gps_enabled'),
                'child_seat_available' => $request->boolean('child_seat_available'),
                'wheelchair_accessible' => $request->boolean('wheelchair_accessible'),
                'pet_friendly' => $request->boolean('pet_friendly'),
            ]);

            VehicleDocument::create([
                'vehicle_id' => $vehicle->id,
                'registration_book' => $this->upload($request, 'registration_book', $registrationNumber, 'documents'),
                'insurance_certificate' => $this->upload($request, 'insurance_certificate', $registrationNumber, 'documents'),
                'revenue_license' => $this->upload($request, 'revenue_license', $registrationNumber, 'documents'),
                'emission_test_certificate' => $this->upload($request, 'emission_test_certificate', $registrationNumber, 'documents'),
                'driving_license_copy' => $this->upload($request, 'vehicle_driving_license_copy', $registrationNumber, 'documents'),
                'insurance_expiry_date' => $request->insurance_expiry_date,
                'revenue_license_expiry_date' => $request->revenue_license_expiry_date,
                'emission_test_expiry_date' => $request->emission_test_expiry_date,
            ]);

            VehiclePicture::create([
                'vehicle_id' => $vehicle->id,
                'front_view' => $this->upload($request, 'front_view', $registrationNumber, 'photos'),
                'rear_view' => $this->upload($request, 'rear_view', $registrationNumber, 'photos'),
                'left_side_view' => $this->upload($request, 'left_side_view', $registrationNumber, 'photos'),
                'right_side_view' => $this->upload($request, 'right_side_view', $registrationNumber, 'photos'),
                'front_interior_view' => $this->upload($request, 'front_interior_view', $registrationNumber, 'photos'),
                'passenger_seating_area' => $this->upload($request, 'passenger_seating_area', $registrationNumber, 'photos'),
                'dashboard_view' => $this->upload($request, 'dashboard_view', $registrationNumber, 'photos'),
                'luggage_compartment_view' => $this->upload($request, 'luggage_compartment_view', $registrationNumber, 'photos'),
            ]);

            BankDetail::create([
                'driver_id' => $driver->id,
                'bank_name' => $request->bank_name,
                'branch_name' => $request->branch_name,
                'account_holder_name' => $request->account_holder_name,
                'account_number' => $request->account_number,
                'swift_code' => $request->swift_code,
            ]);

            DriverDocument::create([
                'driver_id' => $driver->id,
                'nic_copy' => $this->upload($request, 'nic_copy', $registrationNumber, 'documents'),
                'passport_copy' => $this->upload($request, 'passport_copy', $registrationNumber, 'documents'),
                'driver_photo' => $this->upload($request, 'document_driver_photo', $registrationNumber, 'documents'),
                'driving_license_copy' => $this->upload($request, 'driving_license_copy', $registrationNumber, 'documents'),
                'tourist_driving_license_copy' => $this->upload($request, 'tourist_driving_license_copy', $registrationNumber, 'documents'),
                'no_objection_letter' => $this->upload($request, 'no_objection_letter', $registrationNumber, 'documents'),
                'police_clearance_certificate' => $this->upload($request, 'police_clearance_certificate', $registrationNumber, 'documents'),
                'medical_fitness_certificate' => $this->upload($request, 'medical_fitness_certificate', $registrationNumber, 'documents'),
                'tourism_authority_registration' => $this->upload($request, 'tourism_authority_registration', $registrationNumber, 'documents'),
                'airport_permit' => $this->upload($request, 'airport_permit', $registrationNumber, 'documents'),
            ]);

            AdminVerification::create([
                'driver_id' => $driver->id,
                'nic_verified' => $request->boolean('nic_verified'),
                'driving_license_verified' => $request->boolean('driving_license_verified'),
                'tourist_license_verified' => $request->boolean('tourist_license_verified'),
                'vehicle_ownership_verified' => $request->boolean('vehicle_ownership_verified'),
                'vehicle_documents_verified' => $request->boolean('vehicle_documents_verified'),
                'insurance_verified' => $request->boolean('insurance_verified'),
                'no_objection_letter_verified' => $request->boolean('no_objection_letter_verified'),
                'vehicle_photos_approved' => $request->boolean('vehicle_photos_approved'),
                'tourism_registration_verified' => $request->boolean('tourism_registration_verified'),
                'driver_approved' => $request->boolean('driver_approved'),
                'remarks' => $request->remarks,
                'approved_by' => auth()->id(),
                'approval_date' => now()->toDateString(),
            ]);

            $user = User::create([
                'role_id' => 1,
                'name' => $driver->full_name,
                'driver_id' => $driver->id,
                'email' => $driver->email,
                'password' => Hash::make('Test@123'),
            ]);
        });

        return redirect()->route('drivers.index')
            ->with('success', 'Driver created successfully.');
    }

    private function upload(Request $request, string $field, string $registrationNumber, string $folder): ?string
    {
        if (!$request->hasFile($field)) {
            return null;
        }

        $file = $request->file($field);

        $driverCode = strtolower($registrationNumber);
        $docName = $this->cleanDocName($field);

        $path = "drivers/{$registrationNumber}/{$folder}";

        if (str_starts_with($file->getMimeType(), 'image/')) {
            $fileName = "{$driverCode}-{$docName}.webp";
            return $this->saveAsWebp($file, $path, $fileName);
        }

        $extension = $file->getClientOriginalExtension();
        $fileName = "{$driverCode}-{$docName}.{$extension}";

        return $file->storeAs($path, $fileName, 'public');
    }

    public function show(Driver $driver)
    {
        $driver->load([
            'languages',
            'serviceCategories',
            'availability',
            'technologyInfo',
            'tourismCompliance',
            'emergencyContact',
            'license',
            'vehicles.features',
            'vehicles.documents',
            'vehicles.pictures',
            'bankDetail',
            'documents',
            'adminVerification',
        ]);

        return Inertia::render('Drivers/Show', [
            'driver' => $driver,
        ]);
    }

    public function edit(Driver $driver)
    {
        $driver->load([
            'emergencyContact',
            'license',
            'languages',
            'serviceCategories',
            'availability',
            'technologyInfo',
            'tourismCompliance',
            'vehicles.features',
            'vehicles.documents',
            'vehicles.pictures',
            'bankDetail',
            'documents',
            'adminVerification',
        ]);

        return Inertia::render('Drivers/Edit', [
            'driver' => $driver,
            'serviceCategories' => ServiceCategory::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Driver $driver)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'full_name' => 'required|string|max:255',
            'nic_number' => 'required|string|max:20|unique:drivers,nic_number,' . $driver->id,
            'date_of_birth' => 'required|date',
            'gender' => 'required|string',
            'nationality' => 'required|string|max:100',
            'marital_status' => 'required|string|max:50',
            'mobile_number' => 'required|string|max:20',
            'city' => 'required|string|max:100',
            'permanent_address' => 'required|string',
            'license_type' => 'required|string|max:100',
            'license_number' => 'required|string|max:100',
        ]);

        DB::transaction(function () use ($request, $driver) {
            $reg = $driver->registration_number;

            $driver->update([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'full_name' => $request->full_name,
                'nic_number' => $request->nic_number,
                'passport_number' => $request->passport_number,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'marital_status' => $request->marital_status,
                'mobile_number' => $request->mobile_number,
                'whatsapp_number' => $request->whatsapp_number,
                'alternative_contact_number' => $request->alternative_contact_number,
                'email' => $request->email,
                'permanent_address' => $request->permanent_address,
                'current_address' => $request->current_address,
                'city' => $request->city,
                'driver_photo' => $this->replaceUpload($request, 'driver_photo', $driver->driver_photo, $reg, 'profile'),
                'previous_employer' => $request->previous_employer,
                'previous_tourism_experience' => $request->previous_tourism_experience,
                'accident_history' => $request->accident_history,
                'traffic_violation_history' => $request->traffic_violation_history,
                'driver_status' => $request->driver_status ?? 'Active',
            ]);

            $driver->emergencyContact()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'contact_name' => $request->emergency_contact_name,
                    'relationship' => $request->relationship,
                    'contact_number' => $request->emergency_contact_number,
                    'alternative_contact_number' => $request->emergency_alternative_contact_number,
                    'address' => $request->emergency_address,
                ]
            );

            $driver->license()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'license_number' => $request->license_number,
                    'license_type' => $request->license_type,
                    'issue_date' => $request->issue_date,
                    'expiry_date' => $request->expiry_date,
                    'years_of_experience' => $request->years_of_experience,
                    'tourist_license_available' => $request->boolean('tourist_license_available'),
                    'tourist_license_number' => $request->tourist_license_number,
                    'tourist_issue_date' => $request->tourist_issue_date,
                    'tourist_expiry_date' => $request->tourist_expiry_date,
                ]
            );

            $driver->languages()->delete();
            foreach ($request->driver_languages ?? [] as $language) {
                $driver->languages()->create($language);
            }

            $driver->serviceCategories()->sync($request->service_category_ids ?? []);

            $driver->availability()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'monday' => $request->boolean('monday'),
                    'tuesday' => $request->boolean('tuesday'),
                    'wednesday' => $request->boolean('wednesday'),
                    'thursday' => $request->boolean('thursday'),
                    'friday' => $request->boolean('friday'),
                    'saturday' => $request->boolean('saturday'),
                    'sunday' => $request->boolean('sunday'),
                    'working_shift' => $request->working_shift,
                    'airport_pickups' => $request->boolean('airport_pickups'),
                    'airport_dropoffs' => $request->boolean('airport_dropoffs'),
                    'tours' => $request->boolean('tours'),
                    'long_distance_travel' => $request->boolean('long_distance_travel'),
                    'overnight_tours' => $request->boolean('overnight_tours'),
                ]
            );

            $driver->technologyInfo()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'smartphone_available' => $request->boolean('smartphone_available'),
                    'device_type' => $request->device_type,
                    'internet_connection_available' => $request->boolean('internet_connection_available'),
                    'gps_tracking_enabled' => $request->boolean('gps_tracking_enabled'),
                    'mobile_app_usage_experience' => $request->boolean('mobile_app_usage_experience'),
                ]
            );

            $tourism = $driver->tourismCompliance;
            $driver->tourismCompliance()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'tourism_registration_number' => $request->tourism_registration_number,
                    'sltda_registered_driver' => $request->boolean('sltda_registered_driver'),
                    'tourist_driving_license_copy' => $this->replaceUpload($request, 'tourist_driving_license_copy_file', $tourism?->tourist_driving_license_copy, $reg, 'tourism'),
                    'tourism_authority_permit_copy' => $this->replaceUpload($request, 'tourism_authority_permit_copy', $tourism?->tourism_authority_permit_copy, $reg, 'tourism'),
                    'airport_access_permit' => $this->replaceUpload($request, 'airport_access_permit', $tourism?->airport_access_permit, $reg, 'tourism'),
                ]
            );

            $vehicle = $driver->vehicles()->firstOrCreate(['driver_id' => $driver->id]);

            $vehicle->update([
                'registration_number' => $request->vehicle_registration_number,
                'vehicle_type' => $request->vehicle_type,
                'brand' => $request->brand,
                'model' => $request->model,
                'vehicle_year' => $request->vehicle_year,
                'color' => $request->color,
                'seating_capacity' => $request->seating_capacity,
                'luggage_capacity' => $request->luggage_capacity,
                'fuel_type' => $request->fuel_type,
                'transmission_type' => $request->transmission_type,
                'ownership_type' => $request->ownership_type,
                'ownership_confirmation_letter' => $this->replaceUpload($request, 'ownership_confirmation_letter', $vehicle->ownership_confirmation_letter, $reg, 'ownership'),
            ]);

            $vehicle->features()->updateOrCreate(
                ['vehicle_id' => $vehicle->id],
                [
                    'air_conditioned' => $request->boolean('air_conditioned'),
                    'wifi_available' => $request->boolean('wifi_available'),
                    'gps_enabled' => $request->boolean('gps_enabled'),
                    'child_seat_available' => $request->boolean('child_seat_available'),
                    'wheelchair_accessible' => $request->boolean('wheelchair_accessible'),
                    'pet_friendly' => $request->boolean('pet_friendly'),
                ]
            );

            $vehicleDocs = $vehicle->documents;
            $vehicle->documents()->updateOrCreate(
                ['vehicle_id' => $vehicle->id],
                [
                    'registration_book' => $this->replaceUpload($request, 'registration_book', $vehicleDocs?->registration_book, $reg, 'vehicle-documents'),
                    'insurance_certificate' => $this->replaceUpload($request, 'insurance_certificate', $vehicleDocs?->insurance_certificate, $reg, 'vehicle-documents'),
                    'revenue_license' => $this->replaceUpload($request, 'revenue_license', $vehicleDocs?->revenue_license, $reg, 'vehicle-documents'),
                    'emission_test_certificate' => $this->replaceUpload($request, 'emission_test_certificate', $vehicleDocs?->emission_test_certificate, $reg, 'vehicle-documents'),
                    'driving_license_copy' => $this->replaceUpload($request, 'vehicle_driving_license_copy', $vehicleDocs?->driving_license_copy, $reg, 'vehicle-documents'),
                    'insurance_expiry_date' => $request->insurance_expiry_date,
                    'revenue_license_expiry_date' => $request->revenue_license_expiry_date,
                    'emission_test_expiry_date' => $request->emission_test_expiry_date,
                ]
            );

            $vehiclePics = $vehicle->pictures;
            $vehicle->pictures()->updateOrCreate(
                ['vehicle_id' => $vehicle->id],
                [
                    'front_view' => $this->replaceUpload($request, 'front_view', $vehiclePics?->front_view, $reg, 'vehicle-photos'),
                    'rear_view' => $this->replaceUpload($request, 'rear_view', $vehiclePics?->rear_view, $reg, 'vehicle-photos'),
                    'left_side_view' => $this->replaceUpload($request, 'left_side_view', $vehiclePics?->left_side_view, $reg, 'vehicle-photos'),
                    'right_side_view' => $this->replaceUpload($request, 'right_side_view', $vehiclePics?->right_side_view, $reg, 'vehicle-photos'),
                    'front_interior_view' => $this->replaceUpload($request, 'front_interior_view', $vehiclePics?->front_interior_view, $reg, 'vehicle-photos'),
                    'passenger_seating_area' => $this->replaceUpload($request, 'passenger_seating_area', $vehiclePics?->passenger_seating_area, $reg, 'vehicle-photos'),
                    'dashboard_view' => $this->replaceUpload($request, 'dashboard_view', $vehiclePics?->dashboard_view, $reg, 'vehicle-photos'),
                    'luggage_compartment_view' => $this->replaceUpload($request, 'luggage_compartment_view', $vehiclePics?->luggage_compartment_view, $reg, 'vehicle-photos'),
                ]
            );

            $driverDocs = $driver->documents;
            $driver->documents()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'nic_copy' => $this->replaceUpload($request, 'nic_copy', $driverDocs?->nic_copy, $reg, 'driver-documents'),
                    'passport_copy' => $this->replaceUpload($request, 'passport_copy', $driverDocs?->passport_copy, $reg, 'driver-documents'),
                    'driver_photo' => $this->replaceUpload($request, 'document_driver_photo', $driverDocs?->driver_photo, $reg, 'driver-documents'),
                    'driving_license_copy' => $this->replaceUpload($request, 'driving_license_copy', $driverDocs?->driving_license_copy, $reg, 'driver-documents'),
                    'tourist_driving_license_copy' => $this->replaceUpload($request, 'tourist_driving_license_copy', $driverDocs?->tourist_driving_license_copy, $reg, 'driver-documents'),
                    'no_objection_letter' => $this->replaceUpload($request, 'no_objection_letter', $driverDocs?->no_objection_letter, $reg, 'driver-documents'),
                    'police_clearance_certificate' => $this->replaceUpload($request, 'police_clearance_certificate', $driverDocs?->police_clearance_certificate, $reg, 'driver-documents'),
                    'medical_fitness_certificate' => $this->replaceUpload($request, 'medical_fitness_certificate', $driverDocs?->medical_fitness_certificate, $reg, 'driver-documents'),
                    'tourism_authority_registration' => $this->replaceUpload($request, 'tourism_authority_registration', $driverDocs?->tourism_authority_registration, $reg, 'driver-documents'),
                    'airport_permit' => $this->replaceUpload($request, 'airport_permit', $driverDocs?->airport_permit, $reg, 'driver-documents'),
                ]
            );

            $driver->bankDetail()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'bank_name' => $request->bank_name,
                    'branch_name' => $request->branch_name,
                    'account_holder_name' => $request->account_holder_name,
                    'account_number' => $request->account_number,
                    'swift_code' => $request->swift_code,
                ]
            );

            $driver->adminVerification()->updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'nic_verified' => $request->boolean('nic_verified'),
                    'driving_license_verified' => $request->boolean('driving_license_verified'),
                    'tourist_license_verified' => $request->boolean('tourist_license_verified'),
                    'vehicle_ownership_verified' => $request->boolean('vehicle_ownership_verified'),
                    'vehicle_documents_verified' => $request->boolean('vehicle_documents_verified'),
                    'insurance_verified' => $request->boolean('insurance_verified'),
                    'no_objection_letter_verified' => $request->boolean('no_objection_letter_verified'),
                    'vehicle_photos_approved' => $request->boolean('vehicle_photos_approved'),
                    'tourism_registration_verified' => $request->boolean('tourism_registration_verified'),
                    'driver_approved' => $request->boolean('driver_approved'),
                    'remarks' => $request->remarks,
                    'approved_by' => $request->approved_by,
                    'approval_date' => $request->approval_date,
                ]
            );
        });

        return redirect()->route('drivers.show', $driver)
            ->with('success', 'Driver updated successfully.');
    }

    private function replaceUpload(
        Request $request,
        string $field,
        ?string $oldPath,
        string $registrationNumber,
        string $folder
        ): ?string {
            if (!$request->hasFile($field)) {
                return $oldPath;
            }

        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return $this->upload($request, $field, $registrationNumber, $folder);
    }

    private function cleanDocName(string $field): string
    {
        return str_replace(
            ['_copy_file', '_copy', '_file', '_certificate'],
            '',
            str_replace('_', '-', $field)
        );
    }

    private function saveAsWebp($file, string $path, string $fileName): string
    {
        $fullDir = storage_path("app/public/{$path}");

        if (!File::exists($fullDir)) {
            File::makeDirectory($fullDir, 0755, true);
        }

        $source = match ($file->getMimeType()) {
            'image/jpeg', 'image/jpg' => imagecreatefromjpeg($file->getRealPath()),
            'image/png' => imagecreatefrompng($file->getRealPath()),
            'image/webp' => imagecreatefromwebp($file->getRealPath()),
            default => null,
        };

        if (!$source) {
            return $file->storeAs($path, $fileName, 'public');
        }

        $maxWidth = 1200;
        $width = imagesx($source);
        $height = imagesy($source);

        if ($width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = intval(($height / $width) * $newWidth);

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            imagedestroy($source);
            $source = $resized;
        }

        imagewebp($source, "{$fullDir}/{$fileName}", 75);
        imagedestroy($source);

        return "{$path}/{$fileName}";
    }
}