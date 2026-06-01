import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import toast, { Toaster } from 'react-hot-toast';

export default function Edit({ driver, serviceCategories = [] }) {
    const [activeTab, setActiveTab] = useState('personal');

    const vehicle = driver.vehicles?.[0] ?? {};
    const availability = driver.availability ?? {};
    const tech = driver.technology_info ?? {};
    const emergency = driver.emergency_contact ?? {};
    const license = driver.driving_license ?? {};
    const bank = driver.bank_detail ?? {};
    const admin = driver.admin_verification ?? {};

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
            : [{
                language_name: '',
                speaking_level: '',
                reading_level: '',
                writing_level: '',
            }],

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

        bank_name: bank.bank_name ?? '',
        branch_name: bank.branch_name ?? '',
        account_holder_name: bank.account_holder_name ?? '',
        account_number: bank.account_number ?? '',
        swift_code: bank.swift_code ?? '',

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
        approved_by: admin.approved_by ?? '',
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
        ['vehicle', 'Vehicle'],
        ['bank', 'Bank'],
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
        const current = data.service_category_ids;

        setData(
            'service_category_ids',
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

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
        setData(
            'driver_languages',
            data.driver_languages.filter((_, i) => i !== index)
        );
    };

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
            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
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
            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );

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

    const FileInput = ({ label, name, currentFile }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            {currentFile && (
                <a
                    href={`/storage/${currentFile}`}
                    target="_blank"
                    className="block text-sm text-blue-600 underline mb-1"
                >
                    View current file
                </a>
            )}

            <input
                type="file"
                onChange={(e) => setData(name, e.target.files[0])}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
        </div>
    );

    return (
        <AppSidebarLayout title="Edit Driver">
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Edit Driver</h1>

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
                                {driver.driver_photo && (
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <img
                                            src={`/storage/${driver.driver_photo}`}
                                            className="w-32 h-32 object-cover rounded border mb-3"
                                        />
                                    </div>
                                )}

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
                                </Select>

                                <Input label="Nationality" name="nationality" />

                                <Select label="Marital Status" name="marital_status">
                                    <option value="">Select Marital Status</option>
                                    <option>Single</option>
                                    <option>Married</option>
                                </Select>

                                <Input label="Mobile Number" name="mobile_number" />
                                <Input label="WhatsApp Number" name="whatsapp_number" />
                                <Input label="Alternative Contact Number" name="alternative_contact_number" />
                                <Input label="Email" name="email" type="email" />
                                <Input label="City" name="city" />
                                <FileInput label="Replace Driver Photo" name="driver_photo" currentFile={driver.driver_photo} />
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
                                            <input
                                                value={language.language_name}
                                                onChange={(e) => updateLanguage(index, 'language_name', e.target.value)}
                                                className="border-gray-300 rounded-md"
                                                placeholder="Language"
                                            />

                                            {['speaking_level', 'reading_level', 'writing_level'].map((field) => (
                                                <select
                                                    key={field}
                                                    value={language[field]}
                                                    onChange={(e) => updateLanguage(index, field, e.target.value)}
                                                    className="border-gray-300 rounded-md"
                                                >
                                                    <option value="">Select</option>
                                                    <option>Basic</option>
                                                    <option>Intermediate</option>
                                                    <option>Fluent</option>
                                                </select>
                                            ))}
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
                                <Select label="License Type" name="license_type">
                                    <option value="">Select License Type</option>
                                    <option>Light Vehicle</option>
                                    <option>Heavy Vehicle</option>
                                    <option>Bus</option>
                                    <option>Tourist Driver</option>
                                    <option>Chauffeur</option>
                                </Select>

                                <Input label="License Number" name="license_number" />
                                <Input label="Issue Date" name="issue_date" type="date" />
                                <Input label="Expiry Date" name="expiry_date" type="date" />
                                <Input label="Years of Experience" name="years_of_experience" type="number" />
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
                                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day) => (
                                    <Checkbox key={day} label={day.toUpperCase()} name={day} />
                                ))}

                                <Select label="Working Shift" name="working_shift">
                                    <option value="">Select Shift</option>
                                    <option>Day Shift</option>
                                    <option>Night Shift</option>
                                    <option>Both</option>
                                </Select>

                                <Checkbox label="Available for Airport Pickups" name="airport_pickups" />
                                <Checkbox label="Available for Airport Drop-offs" name="airport_dropoffs" />
                                <Checkbox label="Available for Tours" name="tours" />
                                <Checkbox label="Long Distance Travel" name="long_distance_travel" />
                                <Checkbox label="Overnight Tours" name="overnight_tours" />
                            </Section>
                        )}

                        {activeTab === 'technology' && (
                            <Section title="Technology Information">
                                <Checkbox label="Smartphone Available" name="smartphone_available" />

                                <Select label="Device Type" name="device_type">
                                    <option value="">Select Device</option>
                                    <option>Android</option>
                                    <option>iPhone</option>
                                </Select>

                                <Checkbox label="Internet Connection Available" name="internet_connection_available" />
                                <Checkbox label="GPS Tracking Enabled" name="gps_tracking_enabled" />
                                <Checkbox label="Mobile App Usage Experience" name="mobile_app_usage_experience" />
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

                        {activeTab === 'admin' && (
                            <Section title="Admin Verification">
                                <Checkbox label="NIC Verified" name="nic_verified" />
                                <Checkbox label="Driving License Verified" name="driving_license_verified" />
                                <Checkbox label="Tourist License Verified" name="tourist_license_verified" />
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