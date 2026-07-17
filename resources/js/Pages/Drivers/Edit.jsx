import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import toast, { Toaster } from 'react-hot-toast';

export default function Edit({ driver, serviceCategories = [] }) {
    const [activeTab, setActiveTab] = useState('personal');

    const vehicle = driver.vehicles?.[0] ?? {};
    const features = vehicle.features ?? {};
    const vehicleDocs = vehicle.documents ?? {};
    const vehiclePics = vehicle.pictures ?? {};
    const availability = driver.availability ?? {};
    const tech = driver.technology_info ?? {};
    const tourism = driver.tourism_compliance ?? {};
    const emergency = driver.emergency_contact ?? {};
    const license = driver.license ?? {};
    const bank = driver.bank_detail ?? {};
    const admin = driver.admin_verification ?? {};
    const driverDocs = driver.documents ?? {};
    const { props } = usePage();
    const loggedUser = props.auth?.user;

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',

        first_name: driver.first_name ?? '',
        last_name: driver.last_name ?? '',
        full_name: driver.full_name ?? '',
        nic_number: driver.nic_number ?? '',
        passport_number: driver.passport_number ?? '',
        date_of_birth: driver.date_of_birth ?? '',
        gender: driver.gender ?? 'Male',
        nationality: driver.nationality ?? 'Sri Lankan',
        marital_status: driver.marital_status ?? 'Single',
        mobile_number: driver.mobile_number ?? '',
        whatsapp_number: driver.whatsapp_number ?? '',
        alternative_contact_number: driver.alternative_contact_number ?? '',
        email: driver.email ?? '',
        permanent_address: driver.permanent_address ?? '',
        current_address: driver.current_address ?? '',
        city: driver.city ?? '',
        driver_photo: null,

        emergency_contact_name: emergency.contact_name ?? '',
        relationship: emergency.relationship ?? '',
        emergency_contact_number: emergency.contact_number ?? '',
        emergency_alternative_contact_number: emergency.alternative_contact_number ?? '',
        emergency_address: emergency.address ?? '',

        license_number: license.license_number ?? '',
        license_type: license.license_type ?? '',
        issue_date: license.issue_date ?? '',
        expiry_date: license.expiry_date ?? '',
        years_of_experience: license.years_of_experience ?? '',
        tourist_license_available: license.tourist_license_available ? '1' : '0',
        tourist_license_number: license.tourist_license_number ?? '',
        tourist_issue_date: license.tourist_issue_date ?? '',
        tourist_expiry_date: license.tourist_expiry_date ?? '',
        previous_employer: driver.previous_employer ?? '',
        previous_tourism_experience: driver.previous_tourism_experience ?? '',
        accident_history: driver.accident_history ?? '',
        traffic_violation_history: driver.traffic_violation_history ?? '',

        driver_languages: driver.languages?.length
            ? driver.languages.map((item) => ({
                language_name: item.language_name ?? '',
                speaking_level: item.speaking_level ?? '',
                reading_level: item.reading_level ?? '',
                writing_level: item.writing_level ?? '',
            }))
            : [{ language_name: '', speaking_level: '', reading_level: '', writing_level: '' }],

        service_category_ids: driver.service_categories?.map((item) => item.id) ?? [],

        monday: !!availability.monday,
        tuesday: !!availability.tuesday,
        wednesday: !!availability.wednesday,
        thursday: !!availability.thursday,
        friday: !!availability.friday,
        saturday: !!availability.saturday,
        sunday: !!availability.sunday,
        working_shift: availability.working_shift ?? '',
        airport_pickups: !!availability.airport_pickups,
        airport_dropoffs: !!availability.airport_dropoffs,
        tours: !!availability.tours,
        long_distance_travel: !!availability.long_distance_travel,
        overnight_tours: !!availability.overnight_tours,

        smartphone_available: !!tech.smartphone_available,
        device_type: tech.device_type ?? '',
        internet_connection_available: !!tech.internet_connection_available,
        gps_tracking_enabled: !!tech.gps_tracking_enabled,
        mobile_app_usage_experience: !!tech.mobile_app_usage_experience,

        tourism_registration_number: tourism.tourism_registration_number ?? '',
        sltda_registered_driver: !!tourism.sltda_registered_driver,
        tourist_driving_license_copy_file: null,
        tourism_authority_permit_copy: null,
        airport_access_permit: null,

        vehicle_registration_number: vehicle.registration_number ?? '',
        vehicle_type: vehicle.vehicle_type ?? '',
        brand: vehicle.brand ?? '',
        model: vehicle.model ?? '',
        vehicle_year: vehicle.vehicle_year ?? '',
        color: vehicle.color ?? '',
        seating_capacity: vehicle.seating_capacity ?? '',
        luggage_capacity: vehicle.luggage_capacity ?? '',
        fuel_type: vehicle.fuel_type ?? '',
        transmission_type: vehicle.transmission_type ?? '',
        ownership_type: vehicle.ownership_type ?? '',
        ownership_confirmation_letter: null,

        air_conditioned: !!features.air_conditioned,
        wifi_available: !!features.wifi_available,
        gps_enabled: !!features.gps_enabled,
        child_seat_available: !!features.child_seat_available,
        wheelchair_accessible: !!features.wheelchair_accessible,
        pet_friendly: !!features.pet_friendly,

        registration_book: null,
        insurance_certificate: null,
        revenue_license: null,
        emission_test_certificate: null,
        vehicle_driving_license_copy: null,
        insurance_expiry_date: vehicleDocs.insurance_expiry_date ?? '',
        revenue_license_expiry_date: vehicleDocs.revenue_license_expiry_date ?? '',
        emission_test_expiry_date: vehicleDocs.emission_test_expiry_date ?? '',

        front_view: null,
        rear_view: null,
        left_side_view: null,
        right_side_view: null,
        front_interior_view: null,
        passenger_seating_area: null,
        dashboard_view: null,
        luggage_compartment_view: null,

        bank_name: bank.bank_name ?? '',
        branch_name: bank.branch_name ?? '',
        account_holder_name: bank.account_holder_name ?? '',
        account_number: bank.account_number ?? '',
        swift_code: bank.swift_code ?? '',

        nic_copy: null,
        passport_copy: null,
        document_driver_photo: null,
        driving_license_copy: null,
        tourist_driving_license_copy: null,
        no_objection_letter: null,
        police_clearance_certificate: null,
        medical_fitness_certificate: null,
        tourism_authority_registration: null,
        airport_permit: null,

        nic_verified: !!admin.nic_verified,
        driving_license_verified: !!admin.driving_license_verified,
        tourist_license_verified: !!admin.tourist_license_verified,
        vehicle_ownership_verified: !!admin.vehicle_ownership_verified,
        vehicle_documents_verified: !!admin.vehicle_documents_verified,
        insurance_verified: !!admin.insurance_verified,
        no_objection_letter_verified: !!admin.no_objection_letter_verified,
        vehicle_photos_approved: !!admin.vehicle_photos_approved,
        tourism_registration_verified: !!admin.tourism_registration_verified,
        driver_approved: !!admin.driver_approved,
        remarks: admin.remarks ?? '',
        approved_by: loggedUser?.id ?? '',
        approved_by_name: loggedUser?.name ?? '',
        
        approval_date: admin.approval_date ?? '',
        driver_status: driver.driver_status ?? 'Inactive',
    });

    const tabs = [
        ['personal', 'Personal'],
        ['emergency', 'Emergency'],
        ['languages', 'Languages'],
        ['license', 'License'],
        ['services', 'Services'],
        ['availability', 'Availability'],
        ['technology', 'Technology'],
        ['tourism', 'Tourism'],
        ['vehicle', 'Vehicle'],
        ['features', 'Features'],
        ['vehicleDocs', 'Vehicle Docs'],
        ['vehiclePics', 'Vehicle Photos'],
        ['bank', 'Bank'],
        ['driverDocs', 'Driver Docs'],
        ['admin', 'Admin Checklist'],
    ];

    const currentTabIndex = tabs.findIndex(([key]) => key === activeTab);
    const isFirstTab = currentTabIndex === 0;
    const isLastTab = currentTabIndex === tabs.length - 1;

    const submit = (e) => {
        e.preventDefault();

        post(`/drivers/${driver.id}`, {
            forceFormData: true,
            onSuccess: () => toast.success('Driver updated successfully'),
            onError: () => toast.error('Please check the form errors'),
        });
    };

    const goNext = () => {
        if (!isLastTab) {
            setActiveTab(tabs[currentTabIndex + 1][0]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goPrevious = () => {
        if (!isFirstTab) {
            setActiveTab(tabs[currentTabIndex - 1][0]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const toggleServiceCategory = (id) => {
        setData(
            'service_category_ids',
            data.service_category_ids.includes(id)
                ? data.service_category_ids.filter((item) => item !== id)
                : [...data.service_category_ids, id]
        );
    };

    const addLanguage = () => {
        setData('driver_languages', [
            ...data.driver_languages,
            { language_name: '', speaking_level: '', reading_level: '', writing_level: '' },
        ]);
    };

    const updateLanguage = (index, field, value) => {
        const languages = [...data.driver_languages];
        languages[index][field] = value;
        setData('driver_languages', languages);
    };

    const removeLanguage = (index) => {
        setData('driver_languages', data.driver_languages.filter((_, i) => i !== index));
    };

    return (
        <AppSidebarLayout title="Edit Driver">
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Edit Driver</h1>
                            <p className="text-sm text-gray-500">{driver.registration_number} - {driver.full_name}</p>
                        </div>

                        <Link href={`/drivers/${driver.id}`} className="bg-gray-500 text-white px-4 py-2 rounded">
                            Back
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
                        {tabs.map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`px-4 py-2 rounded text-sm font-semibold ${
                                    activeTab === key ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submit}>
                        {activeTab === 'personal' && (
                            <Section title="Personal Information">
                                <FileInput label="Driver Photo" name="driver_photo" currentFile={driver.driver_photo} setData={setData} image />

                                <Input label="First Name" name="first_name" data={data} setData={setData} errors={errors} />
                                <Input label="Last Name" name="last_name" data={data} setData={setData} errors={errors} />
                                <Input label="Full Name" name="full_name" data={data} setData={setData} errors={errors} />
                                <Input label="NIC Number" name="nic_number" data={data} setData={setData} errors={errors} />
                                <Input label="Passport Number" name="passport_number" data={data} setData={setData} errors={errors} />
                                <Input label="Date of Birth" name="date_of_birth" type="date" data={data} setData={setData} errors={errors} />

                                <Select label="Gender" name="gender" data={data} setData={setData} errors={errors}>
                                    <option value="">Select Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </Select>

                                <Input label="Nationality" name="nationality" data={data} setData={setData} errors={errors} />

                                <Select label="Marital Status" name="marital_status" data={data} setData={setData} errors={errors}>
                                    <option value="">Select Marital Status</option>
                                    <option>Single</option>
                                    <option>Married</option>
                                </Select>

                                <Input label="Mobile Number" name="mobile_number" data={data} setData={setData} errors={errors} />
                                <Input label="WhatsApp Number" name="whatsapp_number" data={data} setData={setData} errors={errors} />
                                <Input label="Alternative Contact Number" name="alternative_contact_number" data={data} setData={setData} errors={errors} />
                                <Input label="Email" name="email" type="email" data={data} setData={setData} errors={errors} />
                                <Input label="City" name="city" data={data} setData={setData} errors={errors} />
                                <TextArea label="Permanent Address" name="permanent_address" data={data} setData={setData} errors={errors} />
                                <TextArea label="Current Address" name="current_address" data={data} setData={setData} errors={errors} />
                            </Section>
                        )}

                        {activeTab === 'emergency' && (
                            <Section title="Emergency Contact">
                                <Input label="Contact Name" name="emergency_contact_name" data={data} setData={setData} errors={errors} />
                                <Input label="Relationship" name="relationship" data={data} setData={setData} errors={errors} />
                                <Input label="Contact Number" name="emergency_contact_number" data={data} setData={setData} errors={errors} />
                                <Input label="Alternative Contact Number" name="emergency_alternative_contact_number" data={data} setData={setData} errors={errors} />
                                <TextArea label="Address" name="emergency_address" data={data} setData={setData} errors={errors} />
                            </Section>
                        )}

                        {activeTab === 'languages' && (
                            <Section title="Language Proficiency">
                                <div className="col-span-3">
                                    <button type="button" onClick={addLanguage} className="bg-green-600 text-white px-4 py-2 rounded">
                                        + Add Language
                                    </button>
                                </div>

                                {data.driver_languages.map((language, index) => (
                                    <div key={index} className="col-span-3 border rounded-lg p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <LanguageInput value={language.language_name} onChange={(value) => updateLanguage(index, 'language_name', value)} />
                                            <LanguageSelect value={language.speaking_level} onChange={(value) => updateLanguage(index, 'speaking_level', value)} />
                                            <LanguageSelect value={language.reading_level} onChange={(value) => updateLanguage(index, 'reading_level', value)} />
                                            <LanguageSelect value={language.writing_level} onChange={(value) => updateLanguage(index, 'writing_level', value)} />
                                        </div>

                                        <button type="button" onClick={() => removeLanguage(index)} className="mt-3 bg-red-600 text-white px-3 py-2 rounded">
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </Section>
                        )}

                        {activeTab === 'license' && (
                            <Section title="Driving License Information">
                                <Select label="License Type" name="license_type" data={data} setData={setData} errors={errors}>
                                    <option value="">Select License Type</option>
                                    <option>Light Vehicle</option>
                                    <option>Heavy Vehicle</option>
                                    <option>Bus</option>
                                    <option>Tourist Driver</option>
                                    <option>Chauffeur</option>
                                </Select>

                                <Input label="License Number" name="license_number" data={data} setData={setData} errors={errors} />
                                <Input label="Issue Date" name="issue_date" type="date" data={data} setData={setData} errors={errors} />
                                <Input label="Expiry Date" name="expiry_date" type="date" data={data} setData={setData} errors={errors} />
                                <Input label="Years of Experience" name="years_of_experience" type="number" data={data} setData={setData} errors={errors} />

                                <Select label="Tourist License Available" name="tourist_license_available" data={data} setData={setData} errors={errors}>
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </Select>

                                <Input label="Tourist License Number" name="tourist_license_number" data={data} setData={setData} errors={errors} />
                                <Input label="Tourist Issue Date" name="tourist_issue_date" type="date" data={data} setData={setData} errors={errors} />
                                <Input label="Tourist Expiry Date" name="tourist_expiry_date" type="date" data={data} setData={setData} errors={errors} />
                                <Input label="Previous Employer" name="previous_employer" data={data} setData={setData} errors={errors} />
                                <TextArea label="Previous Tourism Experience" name="previous_tourism_experience" data={data} setData={setData} errors={errors} />
                                <TextArea label="Accident History" name="accident_history" data={data} setData={setData} errors={errors} />
                                <TextArea label="Traffic Violation History" name="traffic_violation_history" data={data} setData={setData} errors={errors} />
                            </Section>
                        )}

                        {activeTab === 'services' && (
                            <Section title="Service Categories">
                                {serviceCategories.map((category) => (
                                    <label key={category.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.service_category_ids.includes(category.id)}
                                            onChange={() => toggleServiceCategory(category.id)}
                                            className="rounded border-gray-300"
                                        />
                                        <span>{category.name}</span>
                                    </label>
                                ))}
                            </Section>
                        )}

                        {activeTab === 'availability' && (
                            <Section title="Driver Availability">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                    <Checkbox key={day} label={day.toUpperCase()} name={day} data={data} setData={setData} />
                                ))}

                                <Select label="Working Shift" name="working_shift" data={data} setData={setData} errors={errors}>
                                    <option value="">Select Shift</option>
                                    <option>Day Shift</option>
                                    <option>Night Shift</option>
                                    <option>Both</option>
                                </Select>

                                <Checkbox label="Airport Pickups" name="airport_pickups" data={data} setData={setData} />
                                <Checkbox label="Airport Drop-offs" name="airport_dropoffs" data={data} setData={setData} />
                                <Checkbox label="Tours" name="tours" data={data} setData={setData} />
                                <Checkbox label="Long Distance Travel" name="long_distance_travel" data={data} setData={setData} />
                                <Checkbox label="Overnight Tours" name="overnight_tours" data={data} setData={setData} />
                            </Section>
                        )}

                        {activeTab === 'technology' && (
                            <Section title="Technology Information">
                                <Checkbox label="Smartphone Available" name="smartphone_available" data={data} setData={setData} />

                                <Select label="Device Type" name="device_type" data={data} setData={setData} errors={errors}>
                                    <option value="">Select Device</option>
                                    <option>Android</option>
                                    <option>iPhone</option>
                                </Select>

                                <Checkbox label="Internet Connection Available" name="internet_connection_available" data={data} setData={setData} />
                                <Checkbox label="GPS Tracking Enabled" name="gps_tracking_enabled" data={data} setData={setData} />
                                <Checkbox label="Mobile App Usage Experience" name="mobile_app_usage_experience" data={data} setData={setData} />
                            </Section>
                        )}

                        {activeTab === 'tourism' && (
                            <Section title="Tourism & Regulatory Compliance">
                                <Input label="Tourism Registration Number" name="tourism_registration_number" data={data} setData={setData} errors={errors} />
                                <Checkbox label="SLTDA Registered Driver" name="sltda_registered_driver" data={data} setData={setData} />
                                <FileInput label="Tourist Driving License Copy" name="tourist_driving_license_copy_file" currentFile={tourism.tourist_driving_license_copy} setData={setData} />
                                <FileInput label="Tourism Authority Permit Copy" name="tourism_authority_permit_copy" currentFile={tourism.tourism_authority_permit_copy} setData={setData} />
                                <FileInput label="Airport Access Permit" name="airport_access_permit" currentFile={tourism.airport_access_permit} setData={setData} />
                            </Section>
                        )}

                        {activeTab === 'vehicle' && (
                            <Section title="Vehicle Information">
                                <Input label="Vehicle Registration Number" name="vehicle_registration_number" data={data} setData={setData} errors={errors} />

                                <Select label="Vehicle Type" name="vehicle_type" data={data} setData={setData} errors={errors}>
                                    <option value="">Select Vehicle Type</option>
                                    <option>Economy</option>
                                    <option>Sedan</option>
                                    <option>SUV</option>
                                    <option>Van</option>
                                    <option>Luxury Sedan</option>
                                    <option>Luxury SUV</option>
                                    <option>Mini Coach</option>
                                </Select>

                                <Input label="Brand" name="brand" data={data} setData={setData} errors={errors} />
                                <Input label="Model" name="model" data={data} setData={setData} errors={errors} />
                                <Input label="Vehicle Year" name="vehicle_year" type="number" data={data} setData={setData} errors={errors} />
                                <Input label="Color" name="color" data={data} setData={setData} errors={errors} />
                                <Input label="Seating Capacity" name="seating_capacity" type="number" data={data} setData={setData} errors={errors} />
                                <Input label="Luggage Capacity" name="luggage_capacity" type="number" data={data} setData={setData} errors={errors} />
                                <Input label="Fuel Type" name="fuel_type" data={data} setData={setData} errors={errors} />
                                <Input label="Transmission Type" name="transmission_type" data={data} setData={setData} errors={errors} />

                                <Select label="Ownership Type" name="ownership_type" data={data} setData={setData} errors={errors}>
                                    <option value="">Select Ownership</option>
                                    <option>Company-Owned</option>
                                    <option>Outsourced Vehicle</option>
                                    <option>Personally Owned</option>
                                </Select>

                                <FileInput label="Ownership Confirmation Letter" name="ownership_confirmation_letter" currentFile={vehicle.ownership_confirmation_letter} setData={setData} />
                            </Section>
                        )}

                        {activeTab === 'features' && (
                            <Section title="Vehicle Features">
                                <Checkbox label="Air Conditioned" name="air_conditioned" data={data} setData={setData} />
                                <Checkbox label="WiFi Available" name="wifi_available" data={data} setData={setData} />
                                <Checkbox label="GPS Enabled" name="gps_enabled" data={data} setData={setData} />
                                <Checkbox label="Child Seat Available" name="child_seat_available" data={data} setData={setData} />
                                <Checkbox label="Wheelchair Accessible" name="wheelchair_accessible" data={data} setData={setData} />
                                <Checkbox label="Pet Friendly" name="pet_friendly" data={data} setData={setData} />
                            </Section>
                        )}

                        {activeTab === 'vehicleDocs' && (
                            <Section title="Vehicle Documents">
                                <FileInput label="Registration Book" name="registration_book" currentFile={vehicleDocs.registration_book} setData={setData} />
                                <FileInput label="Insurance Certificate" name="insurance_certificate" currentFile={vehicleDocs.insurance_certificate} setData={setData} />
                                <FileInput label="Revenue License" name="revenue_license" currentFile={vehicleDocs.revenue_license} setData={setData} />
                                <FileInput label="Emission Test Certificate" name="emission_test_certificate" currentFile={vehicleDocs.emission_test_certificate} setData={setData} />
                                <FileInput label="Driving License Copy" name="vehicle_driving_license_copy" currentFile={vehicleDocs.driving_license_copy} setData={setData} />
                                <Input label="Insurance Expiry Date" name="insurance_expiry_date" type="date" data={data} setData={setData} errors={errors} />
                                <Input label="Revenue License Expiry Date" name="revenue_license_expiry_date" type="date" data={data} setData={setData} errors={errors} />
                                <Input label="Emission Test Expiry Date" name="emission_test_expiry_date" type="date" data={data} setData={setData} errors={errors} />
                            </Section>
                        )}

                        {activeTab === 'vehiclePics' && (
                            <Section title="Vehicle Pictures">
                                <FileInput label="Front View" name="front_view" currentFile={vehiclePics.front_view} setData={setData} image />
                                <FileInput label="Rear View" name="rear_view" currentFile={vehiclePics.rear_view} setData={setData} image />
                                <FileInput label="Left Side View" name="left_side_view" currentFile={vehiclePics.left_side_view} setData={setData} image />
                                <FileInput label="Right Side View" name="right_side_view" currentFile={vehiclePics.right_side_view} setData={setData} image />
                                <FileInput label="Front Interior View" name="front_interior_view" currentFile={vehiclePics.front_interior_view} setData={setData} image />
                                <FileInput label="Passenger Seating Area" name="passenger_seating_area" currentFile={vehiclePics.passenger_seating_area} setData={setData} image />
                                <FileInput label="Dashboard View" name="dashboard_view" currentFile={vehiclePics.dashboard_view} setData={setData} image />
                                <FileInput label="Luggage Compartment View" name="luggage_compartment_view" currentFile={vehiclePics.luggage_compartment_view} setData={setData} image />
                            </Section>
                        )}

                        {activeTab === 'bank' && (
                            <Section title="Banking Information">
                                <Input label="Bank Name" name="bank_name" data={data} setData={setData} errors={errors} />
                                <Input label="Branch Name" name="branch_name" data={data} setData={setData} errors={errors} />
                                <Input label="Account Holder Name" name="account_holder_name" data={data} setData={setData} errors={errors} />
                                <Input label="Account Number" name="account_number" data={data} setData={setData} errors={errors} />
                                <Input label="Swift Code" name="swift_code" data={data} setData={setData} errors={errors} />
                            </Section>
                        )}

                        {activeTab === 'driverDocs' && (
                            <Section title="Driver Documents">
                                <FileInput label="NIC Copy" name="nic_copy" currentFile={driverDocs.nic_copy} setData={setData} />
                                <FileInput label="Passport Copy" name="passport_copy" currentFile={driverDocs.passport_copy} setData={setData} />
                                <FileInput label="Driver Photograph" name="document_driver_photo" currentFile={driverDocs.driver_photo} setData={setData} image />
                                <FileInput label="Driving License Copy" name="driving_license_copy" currentFile={driverDocs.driving_license_copy} setData={setData} />
                                <FileInput label="Tourist Driving License Copy" name="tourist_driving_license_copy" currentFile={driverDocs.tourist_driving_license_copy} setData={setData} />
                                <FileInput label="No Objection Letter" name="no_objection_letter" currentFile={driverDocs.no_objection_letter} setData={setData} />
                                <FileInput label="Police Clearance Certificate" name="police_clearance_certificate" currentFile={driverDocs.police_clearance_certificate} setData={setData} />
                                <FileInput label="Medical Fitness Certificate" name="medical_fitness_certificate" currentFile={driverDocs.medical_fitness_certificate} setData={setData} />
                                <FileInput label="Tourism Authority Registration" name="tourism_authority_registration" currentFile={driverDocs.tourism_authority_registration} setData={setData} />
                                <FileInput label="Airport Permit" name="airport_permit" currentFile={driverDocs.airport_permit} setData={setData} />
                            </Section>
                        )}

                        {activeTab === 'admin' && (
                            <Section title="Admin Verification">
                                <Checkbox label="NIC Verified" name="nic_verified" data={data} setData={setData} />
                                <Checkbox label="Driving License Verified" name="driving_license_verified" data={data} setData={setData} />
                                <Checkbox label="Tourist License Verified" name="tourist_license_verified" data={data} setData={setData} />
                                <Checkbox label="Vehicle Ownership Verified" name="vehicle_ownership_verified" data={data} setData={setData} />
                                <Checkbox label="Vehicle Documents Verified" name="vehicle_documents_verified" data={data} setData={setData} />
                                <Checkbox label="Insurance Verified" name="insurance_verified" data={data} setData={setData} />
                                <Checkbox label="No Objection Letter Verified" name="no_objection_letter_verified" data={data} setData={setData} />
                                <Checkbox label="Vehicle Photos Approved" name="vehicle_photos_approved" data={data} setData={setData} />
                                <Checkbox label="Tourism Registration Verified" name="tourism_registration_verified" data={data} setData={setData} />
                                <Checkbox label="Driver Approved" name="driver_approved" data={data} setData={setData} />

                                <TextArea label="Remarks" name="remarks" data={data} setData={setData} errors={errors} />
                                <Input label="Approved By" name="approved_by_name" type="text" data={data} setData={setData} errors={errors} />
                                <Input label="Approval Date" name="approval_date" type="date" data={data} setData={setData} errors={errors} />

                                <Select label="Driver Status" name="driver_status" data={data} setData={setData} errors={errors}>
                                    <option>Inactive</option>
                                    <option>Active</option>
                                    <option>Suspended</option>
                                    <option>Rejected</option>
                                </Select>
                            </Section>
                        )}

                        <div className="flex justify-between items-center gap-3 mt-8 border-t pt-6">
                            <Link href={`/drivers/${driver.id}`} className="bg-gray-500 text-white px-6 py-2 rounded">
                                Cancel
                            </Link>

                            <div className="flex gap-3">
                                {!isFirstTab && (
                                    <button type="button" onClick={goPrevious} className="bg-slate-600 text-white px-6 py-2 rounded">
                                        Previous
                                    </button>
                                )}

                                {!isLastTab && (
                                    <button type="button" onClick={goNext} className="bg-blue-700 text-white px-6 py-2 rounded">
                                        Next
                                    </button>
                                )}

                                {isLastTab && (
                                    <button type="submit" disabled={processing} className="bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50">
                                        {processing ? 'Updating...' : 'Update Driver'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    );
}

function Input({ label, name, type = 'text', data, setData, errors }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input type={type} value={data[name] ?? ''} onChange={(e) => setData(name, e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );
}

function Select({ label, name, children, data, setData, errors }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select value={data[name] ?? ''} onChange={(e) => setData(name, e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm">
                {children}
            </select>
            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );
}

function TextArea({ label, name, data, setData, errors }) {
    return (
        <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <textarea value={data[name] ?? ''} onChange={(e) => setData(name, e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" rows="3" />
            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );
}

function Checkbox({ label, name, data, setData }) {
    return (
        <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!data[name]} onChange={(e) => setData(name, e.target.checked)} className="rounded border-gray-300" />
            <span>{label}</span>
        </label>
    );
}

function FileInput({ label, name, currentFile, setData, image = false }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            {currentFile && (
                <div className="mb-2">
                    {image ? (
                        <a href={`/storage/${currentFile}`} target="_blank" rel="noreferrer">
                            <img src={`/storage/${currentFile}`} className="w-32 h-24 object-cover rounded border" />
                        </a>
                    ) : (
                        <a href={`/storage/${currentFile}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">
                            View Current File
                        </a>
                    )}
                </div>
            )}

            <input type="file" onChange={(e) => setData(name, e.target.files[0])} className="mt-1 w-full border border-gray-300 rounded-md p-2" />

            <p className="text-xs text-gray-500 mt-1">
                Uploading a new file will replace the old one.
            </p>
        </div>
    );
}

function LanguageInput({ value, onChange }) {
    return (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="border-gray-300 rounded-md" placeholder="Language" />
    );
}

function LanguageSelect({ value, onChange }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="border-gray-300 rounded-md">
            <option value="">Select</option>
            <option>Basic</option>
            <option>Intermediate</option>
            <option>Fluent</option>
        </select>
    );
}