import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect  } from 'react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import toast, { Toaster } from 'react-hot-toast';

export default function Create({ serviceCategories = [] }) {
    const [activeTab, setActiveTab] = useState('personal');

    const { props } = usePage();
    const loggedUser = props.auth?.user;
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        full_name: '',
        nic_number: '',
        passport_number: '',
        date_of_birth: '',
        gender: 'Male',
        nationality: 'Sri Lankan',
        marital_status: 'Single',
        mobile_number: '',
        whatsapp_number: '',
        alternative_contact_number: '',
        email: '',
        permanent_address: '',
        same_as_permanent: true,
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

        driver_languages: [{ language_name: '', speaking_level: '', reading_level: '', writing_level: '' }],
        service_category_ids: [],

        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        working_shift: '',
        airport_pickups: false,
        airport_dropoffs: false,
        tours: false,
        long_distance_travel: false,
        overnight_tours: false,

        smartphone_available: true,
        device_type: '',
        internet_connection_available: true,
        gps_tracking_enabled: false,
        mobile_app_usage_experience: true,

        tourism_registration_number: '',
        sltda_registered_driver: false,
        tourist_driving_license_copy_file: null,
        tourism_authority_permit_copy: null,
        airport_access_permit: null,

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

        air_conditioned: true,
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

        nic_verified: true,
        driving_license_verified: true,
        tourist_license_verified: true,
        vehicle_ownership_verified: true,
        vehicle_documents_verified: true,
        insurance_verified: true,
        no_objection_letter_verified: true,
        vehicle_photos_approved: true,
        tourism_registration_verified: true,
        driver_approved: true,
        remarks: '',
        approved_by: loggedUser?.id ?? '',
        approved_by_name: loggedUser?.name ?? '',
        approval_date: today,
        driver_status: 'Active',
    });

    const tabs = [
        ['personal', 'Personal'],
        ['emergency', 'Emergency'],
        ['languages', 'Languages'],
        ['license', 'License'],
        ['services', 'Services'],
        ['availability', 'Availability'],
        ['technology', 'Technology'],
        // ['tourism', 'Tourism'],
        ['vehicle', 'Vehicle'],
        ['features', 'Features'],
        ['vehicleDocs', 'Vehicle Docs'],
        ['vehiclePics', 'Vehicle Photos'],
        ['bank', 'Bank'],
        ['driverDocs', 'Driver Docs'],
        ['admin', 'Admin Checklist'],
    ];

    const requiredFieldsByTab = {
        personal: [
            { field: 'first_name', message: 'First Name is required' },
            { field: 'last_name', message: 'Last Name is required' },
            { field: 'full_name', message: 'Full Name is required' },
            { field: 'nic_number', message: 'NIC Number is required' },
            { field: 'date_of_birth', message: 'Date of Birth is required' },
            { field: 'gender', message: 'Gender is required' },
            { field: 'nationality', message: 'Nationality is required' },
            { field: 'marital_status', message: 'Marital Status is required' },
            { field: 'mobile_number', message: 'Mobile Number is required' },
            { field: 'whatsapp_number', message: 'WhatsApp Number is required' },
            { field: 'email', message: 'Email is required' },
            { field: 'city', message: 'City is required' },
            { field: 'permanent_address', message: 'Permanent Address is required' },
            { field: 'driver_photo', message: 'Driver Photo is required' },
        ],
        emergency: [
            { field: 'emergency_contact_name', message: 'Emergency Contact Name is required' },
            { field: 'relationship', message: 'Relationship is required' },
            { field: 'emergency_contact_number', message: 'Emergency Contact Number is required' },
        ],
        license: [
            { field: 'license_type', message: 'License Type is required' },
            { field: 'license_number', message: 'License Number is required' },
            { field: 'issue_date', message: 'License Issue Date is required' },
            { field: 'years_of_experience', message: 'Years of Experience is required' },
        ],
        services: [
            { field: 'service_category_ids', message: 'Please select at least one Service Category' },
        ],
        vehicle: [
            { field: 'vehicle_registration_number', message: 'Vehicle Registration Number is required' },
            { field: 'vehicle_type', message: 'Vehicle Type is required' },
            { field: 'brand', message: 'Vehicle Brand is required' },
            { field: 'model', message: 'Vehicle Model is required' },
        ],
        // availability: [
        //     { field: 'working_shift', message: 'Working Shift is required' },
        // ],
        // technology: [
        //     { field: 'device_type', message: 'Device Type is required' },
        // ],
        vehicleDocs: [
            { field: 'registration_book', message: 'Registration Book is required' },
            { field: 'insurance_certificate', message: 'Insurance Certificate is required' },
            { field: 'revenue_license', message: 'Revenue License is required' },
            // { field: 'emission_test_certificate', message: 'Emission Test Certificate is required' },
            // { field: 'vehicle_driving_license_copy', message: 'Vehicle Driving License Copy is required' },
            { field: 'insurance_expiry_date', message: 'Insurance Expiry Date is required' },
            { field: 'revenue_license_expiry_date', message: 'Revenue License Expiry Date is required' },
            // { field: 'emission_test_expiry_date', message: 'Emission Test Expiry Date is required' },
        ],
        vehiclePics: [
            { field: 'front_view', message: 'Front View image is required' },
            { field: 'rear_view', message: 'Rear View image is required' },
            { field: 'left_side_view', message: 'Left Side View image is required' },
            { field: 'right_side_view', message: 'Right Side View image is required' },
            { field: 'front_interior_view', message: 'Front Interior View image is required' },
            { field: 'passenger_seating_area', message: 'Passenger Seating Area image is required' },
            { field: 'dashboard_view', message: 'Dashboard View image is required' },
            { field: 'luggage_compartment_view', message: 'Luggage Compartment View image is required' },
        ],
        bank: [
            { field: 'bank_name', message: 'Bank Name is required' },
            { field: 'branch_name', message: 'Branch Name is required' },
            { field: 'account_holder_name', message: 'Account Holder Name is required' },
            { field: 'account_number', message: 'Account Number is required' },
        ],
        driverDocs: [
            // { field: 'nic_copy', message: 'NIC Copy is required' },
            // { field: 'passport_copy', message: 'Passport Copy is required' },
            { field: 'driving_license_copy', message: 'Driving License Copy is required' },
            // { field: 'tourist_driving_license_copy', message: 'Tourist Driving License Copy is required' },
            // { field: 'no_objection_letter', message: 'No Objection Letter is required' },
            // { field: 'police_clearance_certificate', message: 'Police Clearance Certificate is required' },
            // { field: 'medical_fitness_certificate', message: 'Medical Fitness Certificate is required' },
            // { field: 'tourism_authority_registration', message: 'Tourism Authority Registration is required' },
            // { field: 'airport_permit', message: 'Airport Permit is required' },
        ],
    };

    const requiredFields = Object.values(requiredFieldsByTab).flat().map((item) => item.field);
    const isRequired = (name) => requiredFields.includes(name);

    const currentTabIndex = tabs.findIndex(([key]) => key === activeTab);
    const isFirstTab = currentTabIndex === 0;
    const isLastTab = currentTabIndex === tabs.length - 1;

    const fieldProps = { data, setData, errors, isRequired };
    const fileProps = { setData, toWebp, data };

    function toWebp(file, name, quality = 0.75, maxWidth = 1200) {
        return new Promise((resolve) => {
            if (!file || !file.type.startsWith('image/')) {
                resolve(file);
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement('canvas');

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob], `${name}.webp`, { type: 'image/webp' }));
                    },
                    'image/webp',
                    quality
                );
            };

            img.onerror = () => resolve(file);
        });
    }

    const getDetailsFromNIC = (nic) => {
        const cleanNic = nic.trim();
        let year;
        let dayOfYear;

        if (/^[0-9]{9}[vVxX]$/.test(cleanNic)) {
            year = 1900 + parseInt(cleanNic.substring(0, 2));
            dayOfYear = parseInt(cleanNic.substring(2, 5));
        } else if (/^[0-9]{12}$/.test(cleanNic)) {
            year = parseInt(cleanNic.substring(0, 4));
            dayOfYear = parseInt(cleanNic.substring(4, 7));
        } else {
            return null;
        }

        let gender = 'Male';

        if (dayOfYear > 500) {
            gender = 'Female';
            dayOfYear -= 500;
        }

        const birthDate = new Date(year, 0);
        birthDate.setDate(dayOfYear);

        return {
            date_of_birth: birthDate.toISOString().split('T')[0],
            gender,
        };
    };

    const isEmptyValue = (value) => {
        if (value === null || value === undefined) return true;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'string') return value.trim() === '';
        return false;
    };

    const validateCurrentTab = () => {
        const rules = requiredFieldsByTab[activeTab] || [];

        for (const rule of rules) {
            if (isEmptyValue(data[rule.field])) {
                toast.error(rule.message);
                return false;
            }
        }

        if (activeTab === 'personal') {
            const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

            if (!nicRegex.test(data.nic_number)) {
                toast.error('Please enter a valid Sri Lankan NIC Number');
                return false;
            }

            if (!data.same_as_permanent && !data.current_address) {
                toast.error('Current Address is required');
                return false;
            }
        }

        if (activeTab === 'languages') {
            for (let i = 0; i < data.driver_languages.length; i++) {
                const language = data.driver_languages[i];

                if (!language.language_name || !language.speaking_level || !language.reading_level || !language.writing_level) {
                    toast.error(`Please complete language row ${i + 1}`);
                    return false;
                }
            }
        }

        if (activeTab === 'license' && data.tourist_license_available === '1') {
            if (!data.tourist_license_number || !data.tourist_issue_date || !data.tourist_expiry_date) {
                toast.error('Please complete tourist license details');
                return false;
            }
        }

        return true;
    };

    const goNext = () => {
        if (!validateCurrentTab()) return;

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

    const submit = (e) => {
        e.preventDefault();

        const submitData = {
            ...data,
            current_address: data.same_as_permanent ? data.permanent_address : data.current_address,
        };

        setData(submitData);

        post('/drivers', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Driver created successfully'),
            onError: (errors) => {
                const firstError = Object.values(errors)[0];

                if (Array.isArray(firstError)) {
                    toast.error(firstError[0]);
                } else {
                    toast.error(firstError);
                }
            },
        });
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
        <AppSidebarLayout title="Create Driver">
            <Toaster position="top-right" />

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
                                <Input {...fieldProps} label="First Name" name="first_name" />
                                <Input {...fieldProps} label="Last Name" name="last_name" />
                                <Input {...fieldProps} label="Full Name" name="full_name" />

                                <NICInput
                                    {...fieldProps}
                                    label="NIC Number"
                                    name="nic_number"
                                    getDetailsFromNIC={getDetailsFromNIC}
                                />

                                <Input {...fieldProps} label="Passport Number" name="passport_number" />
                                <Input {...fieldProps} label="Date of Birth" name="date_of_birth" type="date" />

                                <Select {...fieldProps} label="Gender" name="gender">
                                    <option value="">Select Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </Select>

                                <Input {...fieldProps} label="Nationality" name="nationality" />

                                <Select {...fieldProps} label="Marital Status" name="marital_status">
                                    <option value="">Select Marital Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                </Select>
                                <Input {...fieldProps} label="Mobile Number" name="mobile_number"
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setData({
                                            ...data,
                                            mobile_number: value,
                                            whatsapp_number: value,
                                        });
                                    }}
                                />
                                <Input {...fieldProps} label="WhatsApp Number" name="whatsapp_number" />
                                <Input {...fieldProps} label="Alternative Contact Number" name="alternative_contact_number" />
                                <Input {...fieldProps} label="Email" name="email" type="email" />
                                <Input {...fieldProps} label="City" name="city" />

                                <DriverPhotoInput setData={setData} toWebp={toWebp} data={data} />

                                <TextArea {...fieldProps} label="Permanent Address" name="permanent_address" />

                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.same_as_permanent}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setData({
                                                    ...data,
                                                    same_as_permanent: checked,
                                                    current_address: checked ? data.permanent_address : '',
                                                });
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Current address is same as permanent address
                                        </span>
                                    </label>
                                </div>

                                {!data.same_as_permanent && (
                                    <TextArea {...fieldProps} label="Current Address" name="current_address" required />
                                )}
                            </Section>
                        )}

                        {activeTab === 'emergency' && (
                            <Section title="Emergency Contact">
                                <Input {...fieldProps} label="Contact Name" name="emergency_contact_name" />
                                <Input {...fieldProps} label="Relationship" name="relationship" />
                                <Input {...fieldProps} label="Contact Number" name="emergency_contact_number" />
                                {/* <Input {...fieldProps} label="Alternative Contact Number" name="emergency_alternative_contact_number" />
                                <TextArea {...fieldProps} label="Address" name="emergency_address" /> */}
                            </Section>
                        )}

                        {activeTab === 'languages' && (
                            <Section title="Language Proficiency">
                                <div className="col-span-3 mb-4">
                                    <button type="button" onClick={addLanguage} className="bg-green-600 text-white px-4 py-2 rounded">
                                        + Add Language
                                    </button>
                                </div>

                                {data.driver_languages.map((language, index) => (
                                    <div key={index} className="col-span-3 border rounded-lg p-4 bg-gray-50 mb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <LanguageInput
                                                label="Language"
                                                value={language.language_name}
                                                onChange={(value) => updateLanguage(index, 'language_name', value)}
                                            />

                                            <LanguageSelect
                                                label="Speaking"
                                                value={language.speaking_level}
                                                onChange={(value) => updateLanguage(index, 'speaking_level', value)}
                                            />

                                            <LanguageSelect
                                                label="Reading"
                                                value={language.reading_level}
                                                onChange={(value) => updateLanguage(index, 'reading_level', value)}
                                            />

                                            <LanguageSelect
                                                label="Writing"
                                                value={language.writing_level}
                                                onChange={(value) => updateLanguage(index, 'writing_level', value)}
                                            />
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
                                <Select {...fieldProps} label="License Type" name="license_type">
                                    <option value="">Select License Type</option>
                                    <option value="Light Vehicle">Light Vehicle</option>
                                    <option value="Heavy Vehicle">Heavy Vehicle</option>
                                    <option value="Bus">Bus</option>
                                    <option value="Tourist Driver">Tourist Driver</option>
                                    <option value="Chauffeur">Chauffeur</option>
                                </Select>

                                <Input {...fieldProps} label="License Number" name="license_number" />
                                <Input {...fieldProps} label="Issue Date" name="issue_date" type="date" />
                                <Input {...fieldProps} label="Expiry Date" name="expiry_date" type="date" />
                                <Input {...fieldProps} label="Years of Experience" name="years_of_experience" type="number" />

                                <Select {...fieldProps} label="Tourist License Available" name="tourist_license_available">
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </Select>

                                {data.tourist_license_available === '1' && (
                                    <>
                                        <Input {...fieldProps} label="Tourist License Number" name="tourist_license_number" required />
                                        <Input {...fieldProps} label="Tourist Issue Date" name="tourist_issue_date" type="date" required />
                                        <Input {...fieldProps} label="Tourist Expiry Date" name="tourist_expiry_date" type="date" required />
                                    </>
                                )}

                                <Input {...fieldProps} label="Previous Employer" name="previous_employer" />
                                <TextArea {...fieldProps} label="Previous Tourism Experience" name="previous_tourism_experience" />
                                <TextArea {...fieldProps} label="Accident History" name="accident_history" />
                                <TextArea {...fieldProps} label="Traffic Violation History" name="traffic_violation_history" />
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
                                <Checkbox
                                    label="Available All 7 Days"
                                    name="all_days"
                                    data={{
                                        all_days:
                                            data.monday &&
                                            data.tuesday &&
                                            data.wednesday &&
                                            data.thursday &&
                                            data.friday &&
                                            data.saturday &&
                                            data.sunday,
                                    }}
                                    setData={() => {
                                        const checked = !(
                                            data.monday &&
                                            data.tuesday &&
                                            data.wednesday &&
                                            data.thursday &&
                                            data.friday &&
                                            data.saturday &&
                                            data.sunday
                                        );

                                        setData({
                                            ...data,
                                            monday: checked,
                                            tuesday: checked,
                                            wednesday: checked,
                                            thursday: checked,
                                            friday: checked,
                                            saturday: checked,
                                            sunday: checked,
                                        });
                                    }}
                                />

                                <Checkbox {...fieldProps} label="Available for Airport Pickups" name="airport_pickups" />
                                <Checkbox {...fieldProps} label="Available for Airport Drop-offs" name="airport_dropoffs" />
                                <Checkbox {...fieldProps} label="Available for Tours" name="tours" />
                                <Select {...fieldProps} label="Working Shift" name="working_shift">
                                    <option>Both</option>
                                    <option>Day Shift</option>
                                    <option>Night Shift</option>
                                </Select>
                            </Section>
                        )}

                        {activeTab === 'technology' && (
                            <Section title="Technology Information">
                                <Checkbox {...fieldProps} label="Smartphone Available" name="smartphone_available" />

                                <Select {...fieldProps} label="Device Type" name="device_type">
                                    <option>Android</option>
                                    <option>iPhone</option>
                                </Select>

                                <Checkbox {...fieldProps} label="Internet Connection Available" name="internet_connection_available" />
                                <Checkbox {...fieldProps} label="GPS Tracking Enabled" name="gps_tracking_enabled" />
                                <Checkbox {...fieldProps} label="Mobile App Usage Experience" name="mobile_app_usage_experience" />
                            </Section>
                        )}

                        {/* {activeTab === 'tourism' && (
                            <Section title="Tourism & Regulatory Compliance">
                                <Input {...fieldProps} label="Tourism Registration Number" name="tourism_registration_number" />
                                <Checkbox {...fieldProps} label="SLTDA Registered Driver" name="sltda_registered_driver" />
                                <FileInput {...fileProps} label="Tourist Driving License Copy" name="tourist_driving_license_copy_file" />
                                <FileInput {...fileProps} label="Tourism Authority Permit Copy" name="tourism_authority_permit_copy" />
                                <FileInput {...fileProps} label="Airport Access Permit" name="airport_access_permit" />
                            </Section>
                        )} */}

                        {activeTab === 'vehicle' && (
                            <Section title="Vehicle Information">
                                <Input {...fieldProps} label="Vehicle Registration Number" name="vehicle_registration_number" />

                                <Select {...fieldProps} label="Vehicle Type" name="vehicle_type">
                                    <option value="">Select Vehicle Type</option>
                                    {/* <option>Economy</option> */}
                                    <option>Sedan</option>
                                    <option>SUV</option>
                                    <option>Van</option>
                                    <option>Luxury Sedan</option>
                                    {/* <option>Luxury SUV</option>
                                    <option>Mini Coach</option> */}
                                </Select>

                                <Input {...fieldProps} label="Brand" name="brand" />
                                <Input {...fieldProps} label="Model" name="model" />
                                <Input {...fieldProps} label="Vehicle Year" name="vehicle_year" type="number" />
                                {/* <Input {...fieldProps} label="Color" name="color" /> */}
                                <Input {...fieldProps} label="Seating Capacity" name="seating_capacity" type="number" />
                                <Input {...fieldProps} label="Luggage Capacity" name="luggage_capacity" type="number" />
                                {/* <Input {...fieldProps} label="Fuel Type" name="fuel_type" /> */}
                                {/* <Input {...fieldProps} label="Transmission Type" name="transmission_type" /> */}

                                {/* <Select {...fieldProps} label="Ownership Type" name="ownership_type">
                                    <option value="">Select Ownership</option>
                                    <option>Company-Owned</option>
                                    <option>Outsourced Vehicle</option>
                                    <option>Personally Owned</option>
                                </Select> */}

                                {/* <FileInput {...fileProps} label="Ownership Confirmation Letter" name="ownership_confirmation_letter" required={false} /> */}
                            </Section>
                        )}

                        {activeTab === 'features' && (
                            <Section title="Vehicle Features">
                                <Checkbox {...fieldProps} label="Air Conditioned" name="air_conditioned" />
                                <Checkbox {...fieldProps} label="WiFi Available" name="wifi_available" />
                                <Checkbox {...fieldProps} label="GPS Enabled" name="gps_enabled" />
                                <Checkbox {...fieldProps} label="Child Seat Available" name="child_seat_available" />
                                <Checkbox {...fieldProps} label="Wheelchair Accessible" name="wheelchair_accessible" />
                                <Checkbox {...fieldProps} label="Pet Friendly" name="pet_friendly" />
                            </Section>
                        )}

                        {activeTab === 'vehicleDocs' && (
                            <Section title="Vehicle Documents">
                                <FileInput {...fileProps} label="Registration Book" name="registration_book" />
                                <FileInput {...fileProps} label="Insurance Certificate" name="insurance_certificate" />
                                <FileInput {...fileProps} label="Revenue License" name="revenue_license" />
                                <FileInput {...fileProps} label="Emission Test Certificate" name="emission_test_certificate" required={false} />
                                {/* <FileInput {...fileProps} label="Driving License Copy" name="vehicle_driving_license_copy" /> */}

                                <Input {...fieldProps} label="Insurance Expiry Date" name="insurance_expiry_date" type="date" />
                                <Input {...fieldProps} label="Revenue License Expiry Date" name="revenue_license_expiry_date" type="date" />
                                <Input {...fieldProps} label="Emission Test Expiry Date" name="emission_test_expiry_date" type="date" />
                            </Section>
                        )}

                        {activeTab === 'vehiclePics' && (
                            <Section title="Vehicle Pictures">
                                <FileInput {...fileProps} label="Front View" name="front_view" />
                                <FileInput {...fileProps} label="Rear View" name="rear_view" />
                                <FileInput {...fileProps} label="Left Side View" name="left_side_view" />
                                <FileInput {...fileProps} label="Right Side View" name="right_side_view" />
                                <FileInput {...fileProps} label="Front Interior View" name="front_interior_view" />
                                <FileInput {...fileProps} label="Passenger Seating Area" name="passenger_seating_area" />
                                <FileInput {...fileProps} label="Dashboard View" name="dashboard_view" />
                                <FileInput {...fileProps} label="Luggage Compartment View" name="luggage_compartment_view" />
                            </Section>
                        )}

                        {activeTab === 'bank' && (
                            <Section title="Banking Information">
                               <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Bank Name
                                        {isRequired('bank_name') && <span className="text-red-600 ml-1">*</span>}
                                    </label>

                                    <input
                                        list="bank-list"
                                        value={data.bank_name || ''}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                        className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                        placeholder="Search or type bank name"
                                    />

                                    <datalist id="bank-list">
                                        <option value="Bank of Ceylon (BOC)" />
                                        <option value="People's Bank" />
                                        <option value="Commercial Bank" />
                                        <option value="Hatton National Bank (HNB)" />
                                        <option value="Sampath Bank" />
                                        <option value="National Development Bank (NDB)" />
                                        <option value="Seylan Bank" />
                                        <option value="DFCC Bank" />
                                        <option value="Pan Asia Bank" />
                                        <option value="Nations Trust Bank" />
                                        <option value="Union Bank" />
                                        <option value="Cargills Bank" />
                                        <option value="Regional Development Bank (RDB)" />
                                        <option value="Sanasa Development Bank" />
                                        <option value="HSBC" />
                                        <option value="Standard Chartered Bank" />
                                        <option value="Citibank" />
                                        <option value="Other" />
                                    </datalist>
                                </div>
                                <Input {...fieldProps} label="Branch Name" name="branch_name" />
                                <Input {...fieldProps} label="Account Holder Name" name="account_holder_name" />
                                <Input {...fieldProps} label="Account Number" name="account_number" />
                            </Section>
                        )}

                        {activeTab === 'driverDocs' && (
                            <Section title="Driver Documents">
                                {/* <FileInput {...fileProps} label="NIC Copy" name="nic_copy" /> */}
                                {/* <FileInput {...fileProps} label="Passport Copy" name="passport_copy" /> */}
                                <FileInput {...fileProps} label="Driving License Copy" name="driving_license_copy"  />
                                <FileInput {...fileProps} label="Tourist Driving License Copy" name="tourist_driving_license_copy"  required={false} />
                                <FileInput {...fileProps} label="No Objection Letter" name="no_objection_letter"  required={false} />
                                <FileInput {...fileProps} label="Police Clearance Certificate" name="police_clearance_certificate"  required={false} />
                                <FileInput {...fileProps} label="Medical Fitness Certificate" name="medical_fitness_certificate"  required={false} />
                                <FileInput {...fileProps} label="Tourism Authority Registration" name="tourism_authority_registration"  required={false} />
                                <FileInput {...fileProps} label="Airport Permit" name="airport_permit"  required={false} />
                            </Section>
                        )}

                        {activeTab === 'admin' && (
                            <Section title="Admin Verification">
                                <Checkbox {...fieldProps} label="NIC Verified" name="nic_verified" />
                                <Checkbox {...fieldProps} label="Driving License Verified" name="driving_license_verified" />
                                <Checkbox {...fieldProps} label="Tourist License Verified" name="tourist_license_verified" />
                                <Checkbox {...fieldProps} label="Vehicle Ownership Verified" name="vehicle_ownership_verified" />
                                <Checkbox {...fieldProps} label="Vehicle Documents Verified" name="vehicle_documents_verified" />
                                <Checkbox {...fieldProps} label="Insurance Verified" name="insurance_verified" />
                                <Checkbox {...fieldProps} label="No Objection Letter Verified" name="no_objection_letter_verified" />
                                <Checkbox {...fieldProps} label="Vehicle Photos Approved" name="vehicle_photos_approved" />
                                <Checkbox {...fieldProps} label="Tourism Registration Verified" name="tourism_registration_verified" />
                                <Checkbox {...fieldProps} label="Driver Approved" name="driver_approved" />

                                <TextArea {...fieldProps} label="Remarks" name="remarks" />

                                <ReadOnlyInput label="Approved By" value={data.approved_by_name} />
                                <Input {...fieldProps} label="Approval Date" name="approval_date" type="date" />

                                <Select {...fieldProps} label="Driver Status" name="driver_status">
                                    <option>Inactive</option>
                                    <option>Active</option>
                                    <option>Suspended</option>
                                    <option>Rejected</option>
                                    <option>Terminated</option>
                                </Select>
                            </Section>
                        )}

                        <div className="flex justify-between items-center gap-3 mt-8 border-t pt-6">
                            <Link href="/drivers" className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                                Cancel
                            </Link>

                            <div className="flex gap-3">
                                {!isFirstTab && (
                                    <button type="button" onClick={goPrevious} className="bg-slate-600 text-white px-6 py-2 rounded hover:bg-slate-700">
                                        Previous
                                    </button>
                                )}

                                {!isLastTab && (
                                    <button type="button" onClick={goNext} className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800">
                                        Next
                                    </button>
                                )}

                                {isLastTab && (
                                    <button type="submit" disabled={processing} className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 disabled:opacity-50">
                                        {processing ? 'Saving...' : 'Save Driver'}
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

function Input({ label, name, type = 'text', data, setData, errors, isRequired, required = false, onChange, }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {(isRequired(name) || required) && <span className="text-red-600 ml-1">*</span>}
            </label>

            <input
                type={type}
                value={data[name] ?? ''}
                onChange={
                    onChange
                        ? onChange
                        : (e) => setData(name, e.target.value)
                }
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />

            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );
}

function ReadOnlyInput({ label, value }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                <span className="text-red-600 ml-1">*</span>
            </label>

            <input
                type="text"
                value={value || ''}
                readOnly
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
        </div>
    );
}

function NICInput({ label, name, data, setData, errors, isRequired, getDetailsFromNIC }) {
    const handleChange = (e) => {
        const value = e.target.value.toUpperCase();
        const details = getDetailsFromNIC(value);

        if (details) {
            setData({
                ...data,
                [name]: value,
                date_of_birth: details.date_of_birth,
                gender: details.gender,
            });
        } else {
            setData(name, value);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {isRequired(name) && <span className="text-red-600 ml-1">*</span>}
            </label>

            <input
                type="text"
                value={data[name] ?? ''}
                onChange={handleChange}
                placeholder="901234567V or 200012345678"
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm uppercase"
            />

            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );
}

function Select({ label, name, children, data, setData, errors, isRequired }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {isRequired(name) && <span className="text-red-600 ml-1">*</span>}
            </label>

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
}

function TextArea({ label, name, data, setData, errors, isRequired, required = false }) {
    return (
        <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {(isRequired(name) || required) && <span className="text-red-600 ml-1">*</span>}
            </label>

            <textarea
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                rows="3"
            />

            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
        </div>
    );
}

function FileInput({ label, name, setData, toWebp, required = true, data }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (data?.[name]) {
            const file = data[name];
            
            if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
                setFileType('application/pdf');
                setFileName(file.name);
                setPreview(null);
            } else if (file.type?.startsWith('image/')) {
                setFileType(file.type);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }, [data?.[name], name]);

    const uploadFile = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        let finalFile = file;

        if (file.type.startsWith('image/') && typeof toWebp === 'function') {
            finalFile = await toWebp(file, name);
        }

        setData(name, finalFile);
        setFileType(finalFile.type);
        setFileName(finalFile.name);

        if (finalFile.type === 'application/pdf' || finalFile.name?.endsWith('.pdf')) {
            setPreview(null);
            toast.success(`${label} (PDF) selected`);
        } else {
            setPreview(URL.createObjectURL(finalFile));
            toast.success(`${label} selected`);
        }
    };

    const openScanner = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });

            setStream(mediaStream);
            setCameraOpen(true);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch {
            toast.error('Camera access denied or not available');
        }
    };

    const closeScanner = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }

        setStream(null);
        setCameraOpen(false);
    };

    const scanDocument = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                const file = new File([blob], `${name}.webp`, {
                    type: 'image/webp',
                });

                setData(name, file);
                setFileType(file.type);
                setFileName(file.name);
                setPreview(URL.createObjectURL(file));
                closeScanner();

                toast.success(`${label} scanned`);
            },
            'image/webp',
            0.75
        );
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>

            <div className="mt-1 flex flex-wrap gap-2">
                <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={uploadFile}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                />

                <button
                    type="button"
                    onClick={openScanner}
                    className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900"
                >
                    Scan
                </button>
            </div>

            {/* Show preview for images */}
            {preview && fileType?.startsWith('image/') && (
                <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Selected File</p>
                    <img
                        src={preview}
                        alt={label}
                        className="w-40 h-28 object-cover rounded border"
                    />
                </div>
            )}

            {fileType === 'application/pdf' && (
                <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Selected File</p>
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded border border-red-200">
                        <div className="text-red-600 text-2xl">
                            📄
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-700">PDF Document</p>
                            <p className="text-xs text-red-600 truncate">{fileName}</p>
                        </div>
                        <div className="text-green-600 text-lg">✓</div>
                    </div>
                </div>
            )}

            {cameraOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Scan {label}</h2>

                            <button type="button" onClick={closeScanner} className="text-red-600 font-bold">
                                ✕
                            </button>
                        </div>

                        <div className="relative bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full rounded-lg"
                                style={{ transform: 'scaleX(-1)' }}
                            />

                            <div className="absolute inset-8 border-4 border-blue-400 rounded-lg pointer-events-none" />
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={closeScanner} className="bg-gray-500 text-white px-4 py-2 rounded">
                                Cancel
                            </button>

                            <button type="button" onClick={scanDocument} className="bg-green-700 text-white px-4 py-2 rounded">
                                Capture Scan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Checkbox({ label, name, data, setData }) {
    return (
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
}

function LanguageInput({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium">
                {label}
                <span className="text-red-600 ml-1">*</span>
            </label>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full border-gray-300 rounded-md"
                placeholder="English"
            />
        </div>
    );
}

function LanguageSelect({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium">
                {label}
                <span className="text-red-600 ml-1">*</span>
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full border-gray-300 rounded-md"
            >
                <option value="">Select</option>
                <option>Basic</option>
                <option>Intermediate</option>
                <option>Fluent</option>
            </select>
        </div>
    );
}

function DriverPhotoInput({ setData, toWebp, data, }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (data?.driver_photo && !preview) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(data.driver_photo);
        }
    }, [data?.driver_photo, preview]);

    const openCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });

            setStream(mediaStream);
            setCameraOpen(true);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch {
            toast.error('Camera access denied or not available');
        }
    };

    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }

        setCameraOpen(false);
        setStream(null);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                const file = new File([blob], 'driver-photo.webp', {
                    type: 'image/webp',
                });

                setData('driver_photo', file);
                setPreview(URL.createObjectURL(file));
                closeCamera();

                toast.success('Driver photo captured');
            },
            'image/webp',
            0.75
        );
    };

    const uploadFile = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const finalFile = await toWebp(file, 'driver-photo');

        setData('driver_photo', finalFile);
        setPreview(URL.createObjectURL(finalFile));

        toast.success('Driver photo selected');
    };

    return (
        <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
                Driver Photo <span className="text-red-600 ml-1">*</span>
            </label>

            <div className="mt-2 flex flex-wrap gap-3">
                <input
                    type="file"
                    accept="image/*"
                    onChange={uploadFile}
                    className="border border-gray-300 rounded-md p-2"
                />

                <button type="button" onClick={openCamera} className="bg-blue-700 text-white px-4 py-2 rounded">
                    Use Webcam
                </button>
            </div>

            {cameraOpen && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-md rounded border"
                        style={{ transform: 'scaleX(-1)' }}
                    />

                    <canvas ref={canvasRef} className="hidden" />

                    <div className="mt-3 flex gap-3">
                        <button type="button" onClick={capturePhoto} className="bg-green-700 text-white px-4 py-2 rounded">
                            Capture Photo
                        </button>

                        <button type="button" onClick={closeCamera} className="bg-red-600 text-white px-4 py-2 rounded">
                            Cancel Camera
                        </button>
                    </div>
                </div>
            )}

            {preview && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview</p>

                    <img
                        src={preview}
                        alt="Driver Preview"
                        className="w-40 h-40 object-cover rounded border"
                    />
                </div>
            )}
        </div>
    );
}