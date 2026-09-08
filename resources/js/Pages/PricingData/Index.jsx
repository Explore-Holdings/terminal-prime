import { Head, useForm } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { useMemo, useState } from 'react';
import { CheckCircleIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

const templates = {
    location_vehicle_prices: [['city', 'sedan', 'suv', 'van', 'luxury_sedan'], ['Colombo', '0', '0', '0', '0']],
    counter_selling_rate: [['city_name', 'final_rate'], ['Colombo', '0']],
    vehicle_rates: [['vehicle_type', 'rate'], ['Sedan', '0']],
};

function csvContent(rows) {
    return rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export default function Index({ tables = [] }) {
    const [selectedTable, setSelectedTable] = useState(tables[0]?.name ?? 'location_vehicle_prices');
    const form = useForm({ table: selectedTable, file: null });
    const selected = useMemo(() => tables.find(table => table.name === selectedTable), [tables, selectedTable]);

    const changeTable = (name) => {
        setSelectedTable(name);
        form.setData({ table: name, file: null });
    };

    const downloadTemplate = () => {
        const blob = new Blob([csvContent(templates[selectedTable])], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedTable}-template.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post('/pricing-data/import', { forceFormData: true, preserveScroll: true });
    };

    return (
        <AppSidebarLayout title="Pricing Data">
            <Head title="Pricing Data" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0f1d45]">Pricing Data</h1>
                    <p className="mt-2 text-sm text-gray-500">Update location, counter, and vehicle rates from CSV files.</p>
                </div>

                {form.recentlySuccessful && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        <CheckCircleIcon className="h-5 w-5" /> Pricing data imported successfully.
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Data Table</p>
                        <div className="space-y-1">
                            {tables.map(table => (
                                <button
                                    key={table.name}
                                    type="button"
                                    onClick={() => changeTable(table.name)}
                                    className={`w-full rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${selectedTable === table.name ? 'bg-[#0f1d45] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {table.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selected?.label}</h2>
                                <p className="mt-1 text-sm text-gray-500">CSV columns: {selected?.headers.join(', ')}</p>
                            </div>
                            <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                <DocumentArrowDownIcon className="h-5 w-5" /> Download Template
                            </button>
                        </div>

                        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-10 w-10 text-gray-400" />
                            <label className="mt-3 block text-sm font-semibold text-gray-700">
                                Choose CSV file
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    className="mt-3 block w-full text-sm text-gray-600"
                                    onChange={event => form.setData('file', event.target.files?.[0] ?? null)}
                                />
                            </label>
                            {form.data.file && <p className="mt-3 text-xs font-semibold text-blue-700">{form.data.file.name}</p>}
                        </div>

                        {form.errors.file && <p className="mt-3 text-sm font-semibold text-red-600">{form.errors.file}</p>}
                        <div className="mt-6 flex justify-end">
                            <button type="submit" disabled={form.processing || !form.data.file} className="inline-flex items-center gap-2 rounded-lg bg-[#0f1d45] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2d6b] disabled:cursor-not-allowed disabled:opacity-50">
                                <DocumentArrowUpIcon className="h-5 w-5" />
                                {form.processing ? 'Importing...' : 'Import CSV'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
