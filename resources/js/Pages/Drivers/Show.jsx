import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Link } from '@inertiajs/react';

export default function Show({ driver }) {
    return (
        <AppSidebarLayout title="Driver Details">

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Driver Details
                    </h1>

                    <p className="text-gray-500 mt-1">
                        {driver.full_name}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/drivers/${driver.id}/edit`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                    >
                        Edit
                    </Link>

                    <Link
                        href="/drivers"
                        className="bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Back
                    </Link>
                </div>
            </div>

            {/* Personal Information */}
            <Card title="Personal Information">
                <Info label="Full Name" value={driver.full_name} />
                <Info label="NIC Number" value={driver.nic_number} />
                <Info label="Passport Number" value={driver.passport_number} />
                <Info label="Date of Birth" value={driver.date_of_birth} />
                <Info label="Gender" value={driver.gender} />
                <Info label="Nationality" value={driver.nationality} />
                <Info label="Mobile Number" value={driver.mobile_number} />
                <Info label="Email" value={driver.email} />
                <Info label="City" value={driver.city} />
            </Card>

            {/* Emergency Contact */}
            {driver.emergency_contact && (
                <Card title="Emergency Contact">
                    <Info
                        label="Contact Name"
                        value={driver.emergency_contact.contact_name}
                    />

                    <Info
                        label="Relationship"
                        value={driver.emergency_contact.relationship}
                    />

                    <Info
                        label="Phone"
                        value={driver.emergency_contact.contact_number}
                    />
                </Card>
            )}

            {/* License */}
            {driver.license && (
                <Card title="Driving License">
                    <Info
                        label="License Number"
                        value={driver.license.license_number}
                    />

                    <Info
                        label="License Type"
                        value={driver.license.license_type}
                    />

                    <Info
                        label="Issue Date"
                        value={driver.license.issue_date}
                    />

                    <Info
                        label="Expiry Date"
                        value={driver.license.expiry_date}
                    />
                </Card>
            )}

            {/* Languages */}
            <Card title="Languages">
                <div className="overflow-x-auto">
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Language</th>
                                <th className="border p-2">Speaking</th>
                                <th className="border p-2">Reading</th>
                                <th className="border p-2">Writing</th>
                            </tr>
                        </thead>

                        <tbody>
                            {driver.languages?.map((language) => (
                                <tr key={language.id}>
                                    <td className="border p-2">
                                        {language.language_name}
                                    </td>

                                    <td className="border p-2">
                                        {language.speaking_level}
                                    </td>

                                    <td className="border p-2">
                                        {language.reading_level}
                                    </td>

                                    <td className="border p-2">
                                        {language.writing_level}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Services */}
            <Card title="Service Categories">
                <div className="flex flex-wrap gap-2">
                    {driver.service_categories?.map((service) => (
                        <span
                            key={service.id}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                        >
                            {service.name}
                        </span>
                    ))}
                </div>
            </Card>

            {/* Vehicle */}
            {driver.vehicle && (
                <Card title="Vehicle Information">
                    <Info
                        label="Registration Number"
                        value={driver.vehicle.registration_number}
                    />

                    <Info
                        label="Vehicle Type"
                        value={driver.vehicle.vehicle_type}
                    />

                    <Info
                        label="Brand"
                        value={driver.vehicle.brand}
                    />

                    <Info
                        label="Model"
                        value={driver.vehicle.model}
                    />
                </Card>
            )}

            {/* Availability */}
            {driver.availability && (
                <Card title="Availability">
                    <Info
                        label="Working Shift"
                        value={driver.availability.working_shift}
                    />
                </Card>
            )}

            {/* Technology */}
            {driver.technology_info && (
                <Card title="Technology Information">
                    <Info
                        label="Device Type"
                        value={driver.technology_info.device_type}
                    />

                    <Info
                        label="GPS Enabled"
                        value={
                            driver.technology_info.gps_tracking_enabled
                                ? 'Yes'
                                : 'No'
                        }
                    />
                </Card>
            )}

            {/* Tourism */}
            {driver.tourism_compliance && (
                <Card title="Tourism Compliance">
                    <Info
                        label="Registration Number"
                        value={
                            driver.tourism_compliance
                                .tourism_registration_number
                        }
                    />

                    <Info
                        label="SLTDA Registered"
                        value={
                            driver.tourism_compliance
                                .sltda_registered_driver
                                ? 'Yes'
                                : 'No'
                        }
                    />
                </Card>
            )}

            {/* Banking */}
            {driver.bank_detail && (
                <Card title="Banking Information">
                    <Info
                        label="Bank Name"
                        value={driver.bank_detail.bank_name}
                    />

                    <Info
                        label="Account Holder"
                        value={driver.bank_detail.account_holder_name}
                    />

                    <Info
                        label="Account Number"
                        value={driver.bank_detail.account_number}
                    />
                </Card>
            )}

        </AppSidebarLayout>
    );
}

function Card({ title, children }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
                {title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="font-medium">
                {value || '-'}
            </p>
        </div>
    );
}