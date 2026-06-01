import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Create({ serviceCategories = [] }) {
    const [activeTab, setActiveTab] = useState('personal');

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        full_name: '',
        nic_number: '',
        passport_number: '',
        date_of_birth: '',
        gender: '',
        nationality: '',
        marital_status: '',
        mobile_number: '',
        whatsapp_number: '',
        alternative_contact_number: '',
        email: '',
        permanent_address: '',
        current_address: '',
        city: '',
        driver_photo: null,

        emergency_contact_name: '',
        relationship: '',
        emergency_contact_number: '',
        emergency_alternative_contact_number: '',
        emergency_address: '',

        license_number: '',
        license_type: '',
        issue_date: '',
        expiry_date: '',
        years_of_experience: '',
        tourist_license_available: '0',
        tourist_license_number: '',
        tourist_issue_date: '',
        tourist_expiry_date: '',
        previous_employer: '',
        previous_tourism_experience: '',
        accident_history: '',
        traffic_violation_history: '',

        vehicle_registration_number: '',
        vehicle_type: '',
        brand: '',
        model: '',
        vehicle_year: '',
        color: '',
        seating_capacity: '',
        luggage_capacity: '',
        fuel_type: '',
        transmission_type: '',
        ownership_type: '',
        ownership_confirmation_letter: null,

        air_conditioned: false,
        wifi_available: false,
        gps_enabled: false,
        child_seat_available: false,
        wheelchair_accessible: false,
        pet_friendly: false,

        registration_book: null,
        insurance_certificate: null,
        revenue_license: null,
        emission_test_certificate: null,
        vehicle_driving_license_copy: null,
        insurance_expiry_date: '',
        revenue_license_expiry_date: '',
        emission_test_expiry_date: '',

        front_view: null,
        rear_view: null,
        left_side_view: null,
        right_side_view: null,
        front_interior_view: null,
        passenger_seating_area: null,
        dashboard_view: null,
        luggage_compartment_view: null,

        bank_name: '',
        branch_name: '',
        account_holder_name: '',
        account_number: '',
        swift_code: '',

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

        nic_verified: false,
        driving_license_verified: false,
        tourist_license_verified: false,
        vehicle_ownership_verified: false,
        vehicle_documents_verified: false,
        insurance_verified: false,
        no_objection_letter_verified: false,
        vehicle_photos_approved: false,
        tourism_registration_verified: false,
        driver_approved: false,
        remarks: '',
        approved_by: '',
        approval_date: '',
        driver_status: 'Inactive',

        driver_languages: [
            {
                language_name: '',
                speaking_level: '',
                reading_level: '',
                writing_level: '',
            }
        ],

        service_category_ids: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post('/drivers', {
            forceFormData: true,
        });
    };

    const tabs = [
        ['personal', 'Personal'],
        ['emergency', 'Emergency'],
        ['languages', 'Languages'],
        ['license', 'License'],
        ['services', 'Services'],
        ['vehicle', 'Vehicle'],
        ['features', 'Features'],
        ['vehicleDocs', 'Vehicle Docs'],
        ['vehiclePics', 'Vehicle Photos'],
        ['bank', 'Bank'],
        ['driverDocs', 'Driver Docs'],
        ['admin', 'Admin'],
    ];

    const Input = ({ label, name, type = 'text' }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />
            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );

    const FileInput = ({ label, name }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="file"
                onChange={(e) => setData(name, e.target.files[0])}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
        </div>
    );

    const toggleServiceCategory = (id) => {
        const current = data.service_category_ids;

        if (current.includes(id)) {
            setData(
                'service_category_ids',
                current.filter((item) => item !== id)
            );
        } else {
            setData('service_category_ids', [...current, id]);
        }
    };

    const Select = ({ label, name, children }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            >
                {children}
            </select>
        </div>
    );

    const TextArea = ({ label, name }) => (
        <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <textarea
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                rows="3"
            />
        </div>
    );

    const addLanguage = () => {
        setData('driver_languages', [
            ...data.driver_languages,
            {
                language_name: '',
                speaking_level: '',
                reading_level: '',
                writing_level: '',
            }
        ]);
    };

    const updateLanguage = (index, field, value) => {
        const languages = [...data.driver_languages];
        languages[index][field] = value;
        setData('driver_languages', languages);
    };

    const removeLanguage = (index) => {
        const languages = [...data.driver_languages];
        languages.splice(index, 1);
        setData('driver_languages', languages);
    };

    const Checkbox = ({ label, name }) => (
        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={!!data[name]}
                onChange={(e) => setData(name, e.target.checked)}
                className="rounded border-gray-300"
            />
            <span>{label}</span>
        </label>
    );

    return (
        <AppSidebarLayout title="Create Driver">
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Create Driver</h1>

                    <Link href="/drivers" className="bg-gray-500 text-white px-4 py-2 rounded">
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
                                activeTab === key
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit}>
                    {activeTab === 'personal' && (
                        <Section title="Personal Information">
                            <Input label="First Name" name="first_name" />
                            <Input label="Last Name" name="last_name" />
                            <Input label="Full Name" name="full_name" />
                            <Input label="NIC Number" name="nic_number" />
                            <Input label="Passport Number" name="passport_number" />
                            <Input label="Date of Birth" name="date_of_birth" type="date" />

                            <Select label="Gender" name="gender">
                                <option value="">Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </Select>

                            <Input label="Nationality" name="nationality" />
                            <Input label="Marital Status" name="marital_status" />
                            <Input label="Mobile Number" name="mobile_number" />
                            <Input label="WhatsApp Number" name="whatsapp_number" />
                            <Input label="Alternative Contact Number" name="alternative_contact_number" />
                            <Input label="Email" name="email" type="email" />
                            <Input label="City" name="city" />
                            <FileInput label="Driver Photo" name="driver_photo" />
                            <TextArea label="Permanent Address" name="permanent_address" />
                            <TextArea label="Current Address" name="current_address" />
                        </Section>
                    )}

                    {activeTab === 'emergency' && (
                        <Section title="Emergency Contact">
                            <Input label="Contact Name" name="emergency_contact_name" />
                            <Input label="Relationship" name="relationship" />
                            <Input label="Contact Number" name="emergency_contact_number" />
                            <Input label="Alternative Contact Number" name="emergency_alternative_contact_number" />
                            <TextArea label="Address" name="emergency_address" />
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

                    {activeTab === 'languages' && (
                        <Section title="Language Proficiency">

                            <div className="col-span-3 mb-4">
                                <button
                                    type="button"
                                    onClick={addLanguage}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    + Add Language
                                </button>
                            </div>

                            {data.driver_languages.map((language, index) => (
                                <div
                                    key={index}
                                    className="col-span-3 border rounded-lg p-4 bg-gray-50 mb-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                        <div>
                                            <label className="block text-sm font-medium">
                                                Language
                                            </label>

                                            <input
                                                type="text"
                                                value={language.language_name}
                                                onChange={(e) =>
                                                    updateLanguage(
                                                        index,
                                                        'language_name',
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1 w-full border-gray-300 rounded-md"
                                                placeholder="English"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">
                                                Speaking
                                            </label>

                                            <select
                                                value={language.speaking_level}
                                                onChange={(e) =>
                                                    updateLanguage(
                                                        index,
                                                        'speaking_level',
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1 w-full border-gray-300 rounded-md"
                                            >
                                                <option value="">Select</option>
                                                <option>Basic</option>
                                                <option>Intermediate</option>
                                                <option>Fluent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">
                                                Reading
                                            </label>

                                            <select
                                                value={language.reading_level}
                                                onChange={(e) =>
                                                    updateLanguage(
                                                        index,
                                                        'reading_level',
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1 w-full border-gray-300 rounded-md"
                                            >
                                                <option value="">Select</option>
                                                <option>Basic</option>
                                                <option>Intermediate</option>
                                                <option>Fluent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">
                                                Writing
                                            </label>

                                            <select
                                                value={language.writing_level}
                                                onChange={(e) =>
                                                    updateLanguage(
                                                        index,
                                                        'writing_level',
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1 w-full border-gray-300 rounded-md"
                                            >
                                                <option value="">Select</option>
                                                <option>Basic</option>
                                                <option>Intermediate</option>
                                                <option>Fluent</option>
                                            </select>
                                        </div>

                                    </div>

                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => removeLanguage(index)}
                                            className="bg-red-600 text-white px-3 py-2 rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}

                        </Section>
                    )}

                    {activeTab === 'license' && (
                        <Section title="Driving License Information">
                            <Select label="License Type" name="license_type">
                                <option value="">Select License Type</option>
                                <option value="Light Vehicle">Light Vehicle</option>
                                <option value="Heavy Vehicle">Heavy Vehicle</option>
                                <option value="Bus">Bus</option>
                                <option value="Tourist Driver">Tourist Driver</option>
                                <option value="Chauffeur">Chauffeur</option>
                            </Select>
                            <Input label="License Number" name="license_number" />
                            <Input label="Issue Date" name="issue_date" type="date" />
                            <Input label="Expiry Date" name="expiry_date" type="date" />
                            <Input label="Years of Experience" name="years_of_experience" type="number" />

                            <Select label="Tourist License Available" name="tourist_license_available">
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </Select>

                            <Input label="Tourist License Number" name="tourist_license_number" />
                            <Input label="Tourist Issue Date" name="tourist_issue_date" type="date" />
                            <Input label="Tourist Expiry Date" name="tourist_expiry_date" type="date" />
                            <Input label="Previous Employer" name="previous_employer" />
                            <TextArea label="Previous Tourism Experience" name="previous_tourism_experience" />
                            <TextArea label="Accident History" name="accident_history" />
                            <TextArea label="Traffic Violation History" name="traffic_violation_history" />
                        </Section>
                    )}

                    {activeTab === 'vehicle' && (
                        <Section title="Vehicle Information">
                            <Input label="Vehicle Registration Number" name="vehicle_registration_number" />

                            <Select label="Vehicle Type" name="vehicle_type">
                                <option value="">Select Vehicle Type</option>
                                <option>Sedan</option>
                                <option>SUV</option>
                                <option>Van</option>
                                <option>Luxury Sedan</option>
                                <option>Luxury SUV</option>
                                <option>Mini Coach</option>
                            </Select>

                            <Input label="Brand" name="brand" />
                            <Input label="Model" name="model" />
                            <Input label="Vehicle Year" name="vehicle_year" type="number" />
                            <Input label="Color" name="color" />
                            <Input label="Seating Capacity" name="seating_capacity" type="number" />
                            <Input label="Luggage Capacity" name="luggage_capacity" type="number" />
                            <Input label="Fuel Type" name="fuel_type" />
                            <Input label="Transmission Type" name="transmission_type" />

                            <Select label="Ownership Type" name="ownership_type">
                                <option value="">Select Ownership</option>
                                <option>Company-Owned</option>
                                <option>Outsourced Vehicle</option>
                                <option>Personally Owned</option>
                            </Select>

                            <FileInput label="Ownership Confirmation Letter" name="ownership_confirmation_letter" />
                        </Section>
                    )}

                    {activeTab === 'features' && (
                        <Section title="Vehicle Features">
                            <Checkbox label="Air Conditioned" name="air_conditioned" />
                            <Checkbox label="WiFi Available" name="wifi_available" />
                            <Checkbox label="GPS Enabled" name="gps_enabled" />
                            <Checkbox label="Child Seat Available" name="child_seat_available" />
                            <Checkbox label="Wheelchair Accessible" name="wheelchair_accessible" />
                            <Checkbox label="Pet Friendly" name="pet_friendly" />
                        </Section>
                    )}

                    {activeTab === 'vehicleDocs' && (
                        <Section title="Vehicle Documents">
                            <FileInput label="Registration Book" name="registration_book" />
                            <FileInput label="Insurance Certificate" name="insurance_certificate" />
                            <FileInput label="Revenue License" name="revenue_license" />
                            <FileInput label="Emission Test Certificate" name="emission_test_certificate" />
                            <FileInput label="Driving License Copy" name="vehicle_driving_license_copy" />
                            <Input label="Insurance Expiry Date" name="insurance_expiry_date" type="date" />
                            <Input label="Revenue License Expiry Date" name="revenue_license_expiry_date" type="date" />
                            <Input label="Emission Test Expiry Date" name="emission_test_expiry_date" type="date" />
                        </Section>
                    )}

                    {activeTab === 'vehiclePics' && (
                        <Section title="Vehicle Pictures">
                            <FileInput label="Front View" name="front_view" />
                            <FileInput label="Rear View" name="rear_view" />
                            <FileInput label="Left Side View" name="left_side_view" />
                            <FileInput label="Right Side View" name="right_side_view" />
                            <FileInput label="Front Interior View" name="front_interior_view" />
                            <FileInput label="Passenger Seating Area" name="passenger_seating_area" />
                            <FileInput label="Dashboard View" name="dashboard_view" />
                            <FileInput label="Luggage Compartment View" name="luggage_compartment_view" />
                        </Section>
                    )}

                    {activeTab === 'bank' && (
                        <Section title="Banking Information">
                            <Input label="Bank Name" name="bank_name" />
                            <Input label="Branch Name" name="branch_name" />
                            <Input label="Account Holder Name" name="account_holder_name" />
                            <Input label="Account Number" name="account_number" />
                            <Input label="Swift Code" name="swift_code" />
                        </Section>
                    )}

                    {activeTab === 'driverDocs' && (
                        <Section title="Driver Documents">
                            <FileInput label="NIC Copy" name="nic_copy" />
                            <FileInput label="Passport Copy" name="passport_copy" />
                            <FileInput label="Driver Photograph" name="document_driver_photo" />
                            <FileInput label="Driving License Copy" name="driving_license_copy" />
                            <FileInput label="Tourist Driving License Copy" name="tourist_driving_license_copy" />
                            <FileInput label="No Objection Letter" name="no_objection_letter" />
                            <FileInput label="Police Clearance Certificate" name="police_clearance_certificate" />
                            <FileInput label="Medical Fitness Certificate" name="medical_fitness_certificate" />
                            <FileInput label="Tourism Authority Registration" name="tourism_authority_registration" />
                            <FileInput label="Airport Permit" name="airport_permit" />
                        </Section>
                    )}

                    {activeTab === 'admin' && (
                        <Section title="Admin Verification">
                            <Checkbox label="NIC Verified" name="nic_verified" />
                            <Checkbox label="Driving License Verified" name="driving_license_verified" />
                            <Checkbox label="Tourist License Verified" name="tourist_license_verified" />
                            <Checkbox label="Vehicle Ownership Verified" name="vehicle_ownership_verified" />
                            <Checkbox label="Vehicle Documents Verified" name="vehicle_documents_verified" />
                            <Checkbox label="Insurance Verified" name="insurance_verified" />
                            <Checkbox label="No Objection Letter Verified" name="no_objection_letter_verified" />
                            <Checkbox label="Vehicle Photos Approved" name="vehicle_photos_approved" />
                            <Checkbox label="Tourism Registration Verified" name="tourism_registration_verified" />
                            <Checkbox label="Driver Approved" name="driver_approved" />

                            <TextArea label="Remarks" name="remarks" />
                            <Input label="Approved By" name="approved_by" type="number" />
                            <Input label="Approval Date" name="approval_date" type="date" />

                            <Select label="Driver Status" name="driver_status">
                                <option>Inactive</option>
                                <option>Active</option>
                                <option>Suspended</option>
                                <option>Rejected</option>
                            </Select>
                        </Section>
                    )}

                    <div className="flex justify-end gap-3 mt-8">
                        <Link href="/drivers" className="bg-gray-500 text-white px-6 py-2 rounded">
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Driver'}
                        </button>
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