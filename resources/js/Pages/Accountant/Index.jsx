import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function AccountantIndex() {
    return (
        <AppSidebarLayout title="Accountant">
            <Head title="Accountant" />
            
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#0f1d45]">Accountant Dashboard</h1>
                <p className="text-sm font-medium text-gray-400 mt-1">This module is currently blank.</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm text-center">
                <p className="text-gray-500 font-medium">Content removed as requested.</p>
            </div>
        </AppSidebarLayout>
    );
}
