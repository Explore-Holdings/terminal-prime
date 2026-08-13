import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Link, usePage } from '@inertiajs/react';

export default function Show({ driver }) {
    const { auth } = usePage().props;
    const isReadOnly = false;
    const vehicle = driver.vehicle ?? driver.vehicles?.[0] ?? null;

    return (
        <AppSidebarLayout title="Driver Details">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Driver Details
                    </h1>

                    <p className="text-gray-500 mt-1">
                        {driver.registration_number} - {driver.full_name}
                    </p>
                </div>

                <div className="flex gap-2">
                    {!isReadOnly && (
                        <Link
                            href={`/drivers/${driver.id}/edit`}
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        >
                            Edit
                        </Link>
                    )}

                    <Link
                        href="/drivers"
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Back
                    </Link>
                </div>
            </div>

            <Card title="Profile">
                <div className="md:col-span-2 lg:col-span-3 flex flex-col md:flex-row gap-6 items-start">
                    {driver.driver_photo ? (
                        <img
                            src={fileUrl(driver.driver_photo)}
                            alt="Driver"
                            className="w-40 h-40 object-cover rounded-lg border shadow"
                        />
                    ) : (
                        <div className="w-40 h-40 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400">
                            No Photo
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                        <Info label="Registration Number" value={driver.registration_number} />
                        <Info label="Registration Date" value={driver.registration_date} />
                        <Info label="Registration Status" value={driver.registration_status} badge />
                        <Info label="Driver Status" value={driver.driver_status} badge />
                    </div>
                </div>
            </Card>

            <Card title="Personal Information">
                <Info label="First Name" value={driver.first_name} />
                <Info label="Last Name" value={driver.last_name} />
                <Info label="Full Name" value={driver.full_name} />
                <Info label="NIC Number" value={driver.nic_number} />
                <Info label="Passport Number" value={driver.passport_number} />
                <Info label="Date of Birth" value={driver.date_of_birth} />
                <Info label="Gender" value={driver.gender} />
                <Info label="Nationality" value={driver.nationality} />
                <Info label="Marital Status" value={driver.marital_status} />
                <Info label="Mobile Number" value={driver.mobile_number} />
                <Info label="WhatsApp Number" value={driver.whatsapp_number} />
                <Info label="Alternative Contact Number" value={driver.alternative_contact_number} />
                <Info label="Email" value={driver.email} />
                <Info label="City" value={driver.city} />
                <Info label="Permanent Address" value={driver.permanent_address} wide />
                <Info label="Current Address" value={driver.current_address} wide />
            </Card>

            {driver.emergency_contact && (
                <Card title="Emergency Contact">
                    <Info label="Contact Name" value={driver.emergency_contact.contact_name} />
                    <Info label="Relationship" value={driver.emergency_contact.relationship} />
                    <Info label="Contact Number" value={driver.emergency_contact.contact_number} />
                    {/* <Info label="Alternative Contact Number" value={driver.emergency_contact.alternative_contact_number} />
                    <Info label="Address" value={driver.emergency_contact.address} wide /> */}
                </Card>
            )}

            {driver.license && (
                <Card title="Driving License">
                    <Info label="License Number" value={driver.license.license_number} />
                    <Info label="License Type" value={driver.license.license_type} />
                    <Info label="Issue Date" value={driver.license.issue_date} />
                    <Info label="Expiry Date" value={driver.license.expiry_date} />
                    <Info label="Years of Experience" value={driver.license.years_of_experience} />
                    <Info label="Tourist License Available" value={yesNo(driver.license.tourist_license_available)} />
                    <Info label="Tourist License Number" value={driver.license.tourist_license_number} />
                    <Info label="Tourist Issue Date" value={driver.license.tourist_issue_date} />
                    <Info label="Tourist Expiry Date" value={driver.license.tourist_expiry_date} />
                    <Info label="Previous Employer" value={driver.previous_employer} />
                    <Info label="Previous Tourism Experience" value={driver.previous_tourism_experience} wide />
                    <Info label="Accident History" value={driver.accident_history} wide />
                    <Info label="Traffic Violation History" value={driver.traffic_violation_history} wide />
                </Card>
            )}

            <Card title="Languages">
                <div className="md:col-span-2 lg:col-span-3 overflow-x-auto">
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Language</th>
                                <th className="border p-2 text-left">Speaking</th>
                                <th className="border p-2 text-left">Reading</th>
                                <th className="border p-2 text-left">Writing</th>
                            </tr>
                        </thead>

                        <tbody>
                            {driver.languages?.length > 0 ? (
                                driver.languages.map((language) => (
                                    <tr key={language.id}>
                                        <td className="border p-2">{language.language_name}</td>
                                        <td className="border p-2">{language.speaking_level}</td>
                                        <td className="border p-2">{language.reading_level}</td>
                                        <td className="border p-2">{language.writing_level}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="border p-4 text-center text-gray-500">
                                        No languages found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Service Categories">
                <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-2">
                    {driver.service_categories?.length > 0 ? (
                        driver.service_categories.map((service) => (
                            <span
                                key={service.id}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
                            >
                                {service.name}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500">No services selected</p>
                    )}
                </div>
            </Card>

            {driver.availability && (
                <Card title="Availability">
                    <Info label="Monday" value={yesNo(driver.availability.monday)} />
                    <Info label="Tuesday" value={yesNo(driver.availability.tuesday)} />
                    <Info label="Wednesday" value={yesNo(driver.availability.wednesday)} />
                    <Info label="Thursday" value={yesNo(driver.availability.thursday)} />
                    <Info label="Friday" value={yesNo(driver.availability.friday)} />
                    <Info label="Saturday" value={yesNo(driver.availability.saturday)} />
                    <Info label="Sunday" value={yesNo(driver.availability.sunday)} />
                    <Info label="Working Shift" value={driver.availability.working_shift} />
                    <Info label="Airport Pickups" value={yesNo(driver.availability.airport_pickups)} />
                    <Info label="Airport Drop-offs" value={yesNo(driver.availability.airport_dropoffs)} />
                    <Info label="Tours" value={yesNo(driver.availability.tours)} />
                    <Info label="Long Distance Travel" value={yesNo(driver.availability.long_distance_travel)} />
                    <Info label="Overnight Tours" value={yesNo(driver.availability.overnight_tours)} />
                </Card>
            )}

            {driver.technology_info && (
                <Card title="Technology Information">
                    <Info label="Smartphone Available" value={yesNo(driver.technology_info.smartphone_available)} />
                    <Info label="Device Type" value={driver.technology_info.device_type} />
                    <Info label="Internet Connection Available" value={yesNo(driver.technology_info.internet_connection_available)} />
                    <Info label="GPS Tracking Enabled" value={yesNo(driver.technology_info.gps_tracking_enabled)} />
                    <Info label="Mobile App Usage Experience" value={yesNo(driver.technology_info.mobile_app_usage_experience)} />
                </Card>
            )}

            {/* {driver.tourism_compliance && (
                <Card title="Tourism & Regulatory Compliance">
                    <Info
                        label="Tourism Registration Number"
                        value={driver.tourism_compliance.tourism_registration_number}
                    />

                    <Info
                        label="SLTDA Registered Driver"
                        value={yesNo(driver.tourism_compliance.sltda_registered_driver)}
                    />

                    <DocumentLink
                        label="Tourist Driving License Copy"
                        path={driver.tourism_compliance.tourist_driving_license_copy}
                    />

                    <DocumentLink
                        label="Tourism Authority Permit Copy"
                        path={driver.tourism_compliance.tourism_authority_permit_copy}
                    />

                    <DocumentLink
                        label="Airport Access Permit"
                        path={driver.tourism_compliance.airport_access_permit}
                    />
                </Card>
            )} */}

            {vehicle && (
                <>
                    <Card title="Vehicle Information">
                        <Info label="Vehicle Registration Number" value={vehicle.registration_number} />
                        <Info label="Vehicle Type" value={vehicle.vehicle_type} />
                        <Info label="Brand" value={vehicle.brand} />
                        <Info label="Model" value={vehicle.model} />
                        <Info label="Vehicle Year" value={vehicle.vehicle_year} />
                        <Info label="Color" value={vehicle.color} />
                        <Info label="Seating Capacity" value={vehicle.seating_capacity} />
                        <Info label="Luggage Capacity" value={vehicle.luggage_capacity} />
                        <Info label="Fuel Type" value={vehicle.fuel_type} />
                        <Info label="Transmission Type" value={vehicle.transmission_type} />
                        <Info label="Ownership Type" value={vehicle.ownership_type} />
                        <DocumentLink label="Ownership Confirmation Letter" path={vehicle.ownership_confirmation_letter} />
                    </Card>

                    {vehicle.features && (
                        <Card title="Vehicle Features">
                            <Info label="Air Conditioned" value={yesNo(vehicle.features.air_conditioned)} />
                            <Info label="WiFi Available" value={yesNo(vehicle.features.wifi_available)} />
                            <Info label="GPS Enabled" value={yesNo(vehicle.features.gps_enabled)} />
                            <Info label="Child Seat Available" value={yesNo(vehicle.features.child_seat_available)} />
                            <Info label="Wheelchair Accessible" value={yesNo(vehicle.features.wheelchair_accessible)} />
                            <Info label="Pet Friendly" value={yesNo(vehicle.features.pet_friendly)} />
                        </Card>
                    )}

                    {vehicle.documents && (
                        <Card title="Vehicle Documents">
                            <DocumentLink label="Registration Book" path={vehicle.documents.registration_book} />
                            <DocumentLink label="Insurance Certificate" path={vehicle.documents.insurance_certificate} />
                            <DocumentLink label="Revenue License" path={vehicle.documents.revenue_license} />
                            <DocumentLink label="Emission Test Certificate" path={vehicle.documents.emission_test_certificate} />
                            <DocumentLink label="Driving License Copy" path={vehicle.documents.driving_license_copy} />
                            <Info label="Insurance Expiry Date" value={vehicle.documents.insurance_expiry_date} />
                            <Info label="Revenue License Expiry Date" value={vehicle.documents.revenue_license_expiry_date} />
                            <Info label="Emission Test Expiry Date" value={vehicle.documents.emission_test_expiry_date} />
                        </Card>
                    )}

                    {vehicle.pictures && (
                        <Card title="Vehicle Photos">
                            <ImagePreview label="Front View" path={vehicle.pictures.front_view} />
                            <ImagePreview label="Rear View" path={vehicle.pictures.rear_view} />
                            <ImagePreview label="Left Side View" path={vehicle.pictures.left_side_view} />
                            <ImagePreview label="Right Side View" path={vehicle.pictures.right_side_view} />
                            <ImagePreview label="Front Interior View" path={vehicle.pictures.front_interior_view} />
                            <ImagePreview label="Passenger Seating Area" path={vehicle.pictures.passenger_seating_area} />
                            <ImagePreview label="Dashboard View" path={vehicle.pictures.dashboard_view} />
                            <ImagePreview label="Luggage Compartment View" path={vehicle.pictures.luggage_compartment_view} />
                        </Card>
                    )}
                </>
            )}

            {driver.bank_detail && (
                <Card title="Banking Information">
                    <Info label="Bank Name" value={driver.bank_detail.bank_name} />
                    <Info label="Branch Name" value={driver.bank_detail.branch_name} />
                    <Info label="Account Holder Name" value={driver.bank_detail.account_holder_name} />
                    <Info label="Account Number" value={driver.bank_detail.account_number} />
                    <Info label="Swift Code" value={driver.bank_detail.swift_code} />
                </Card>
            )}

            {driver.documents && (
                <Card title="Driver Documents">
                    <DocumentLink label="NIC Copy" path={driver.documents.nic_copy} />
                    <DocumentLink label="Passport Copy" path={driver.documents.passport_copy} />
                    <DocumentLink label="Driver Photograph" path={driver.documents.driver_photo} />
                    <DocumentLink label="Driving License Copy" path={driver.documents.driving_license_copy} />
                    <DocumentLink label="Tourist Driving License Copy" path={driver.documents.tourist_driving_license_copy} />
                    <DocumentLink label="No Objection Letter" path={driver.documents.no_objection_letter} />
                    <DocumentLink label="Police Clearance Certificate" path={driver.documents.police_clearance_certificate} />
                    <DocumentLink label="Medical Fitness Certificate" path={driver.documents.medical_fitness_certificate} />
                    <DocumentLink label="Tourism Authority Registration" path={driver.documents.tourism_authority_registration} />
                    <DocumentLink label="Airport Permit" path={driver.documents.airport_permit} />
                </Card>
            )}

            {driver.admin_verification && (
                <Card title="Admin Verification">
                    <Info label="NIC Verified" value={yesNo(driver.admin_verification.nic_verified)} />
                    <Info label="Driving License Verified" value={yesNo(driver.admin_verification.driving_license_verified)} />
                    <Info label="Tourist License Verified" value={yesNo(driver.admin_verification.tourist_license_verified)} />
                    <Info label="Vehicle Ownership Verified" value={yesNo(driver.admin_verification.vehicle_ownership_verified)} />
                    <Info label="Vehicle Documents Verified" value={yesNo(driver.admin_verification.vehicle_documents_verified)} />
                    <Info label="Insurance Verified" value={yesNo(driver.admin_verification.insurance_verified)} />
                    <Info label="No Objection Letter Verified" value={yesNo(driver.admin_verification.no_objection_letter_verified)} />
                    <Info label="Vehicle Photos Approved" value={yesNo(driver.admin_verification.vehicle_photos_approved)} />
                    <Info label="Tourism Registration Verified" value={yesNo(driver.admin_verification.tourism_registration_verified)} />
                    <Info label="Driver Approved" value={yesNo(driver.admin_verification.driver_approved)} />
                    <Info label="Remarks" value={driver.admin_verification.remarks} wide />
                    <Info
                            label="Approved By"
                            value={
                                driver.admin_verification?.approved_by_name ??
                                driver.admin_verification?.approved_by_user?.name
                            }
                        />
                    <Info label="Approval Date" value={driver.admin_verification.approval_date} />
                </Card>
            )}
        </AppSidebarLayout>
    );
}

function Card({ title, children }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                {title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {children}
            </div>
        </div>
    );
}

function Info({ label, value, wide = false, badge = false }) {
    return (
        <div className={wide ? 'md:col-span-2 lg:col-span-3' : ''}>
            <p className="text-sm text-gray-500">{label}</p>

            {badge ? (
                <span className={badgeClass(value)}>
                    {value || 'N/A'}
                </span>
            ) : (
                <p className="font-medium whitespace-pre-line">
                    {value || '-'}
                </p>
            )}
        </div>
    );
}

function DocumentLink({ label, path }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>

            {path ? (
                <a
                    href={fileUrl(path)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-medium"
                >
                    View / Download
                </a>
            ) : (
                <p className="font-medium">-</p>
            )}
        </div>
    );
}

function ImagePreview({ label, path }) {
    return (
        <div>
            <p className="text-sm text-gray-500 mb-2">{label}</p>

            {path ? (
                <a href={fileUrl(path)} target="_blank" rel="noreferrer">
                    <img
                        src={fileUrl(path)}
                        alt={label}
                        className="w-full h-44 object-cover rounded border shadow-sm hover:opacity-80"
                    />
                </a>
            ) : (
                <div className="w-full h-44 rounded border bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                </div>
            )}
        </div>
    );
}

function fileUrl(path) {
    return `/storage/${path}`;
}

function yesNo(value) {
    return value ? 'Yes' : 'No';
}

function badgeClass(value) {
    const classes = {
        Active: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700',
        Approved: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
        Pending: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700',
        Suspended: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700',
        Rejected: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700',
        Inactive: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600',
    };

    return classes[value] ?? 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600';
}