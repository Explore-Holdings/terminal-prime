import { useState, useMemo, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    CarFront,
    Plus,
    Minus,
    Check,
    Edit3,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
    'Mini Cars',
    'Economy Cars',
    'Standard Cars',
    'Semi Executive Cars',
    'Executive Cars',
    'Luxury Cars',
    'Compact SUVs',
    'Mid Size SUVs',
    'Van',
    'Luxury Coach',
    'Large SUVs',
];

export default function RentACarRatesPanel({ rentACarRates = [], isReadOnly = false }) {
    const [rates, setRates] = useState(rentACarRates);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setRates(rentACarRates);
    }, [rentACarRates]);

    // Available categories (merge defaults and database categories)
    const availableCategories = useMemo(() => {
        const set = new Set(DEFAULT_CATEGORIES);
        (rates || []).forEach((r) => {
            if (r.vehicle_category) set.add(r.vehicle_category.trim());
        });
        return Array.from(set);
    }, [rates]);

    const initialCategory = availableCategories[0] || 'Mini Cars';
    const initialExistingRate = (rentACarRates || []).find(
        (r) => r.vehicle_category?.toLowerCase() === initialCategory.toLowerCase()
    )?.rate || '';

    // Update Form
    const form = useForm({
        vehicle_category: initialCategory,
        rate: initialExistingRate,
    });

    // Auto-sync form rate if category matches on rates refresh
    useEffect(() => {
        if (form.data.vehicle_category) {
            const match = (rates || []).find(
                (r) => r.vehicle_category?.toLowerCase() === form.data.vehicle_category?.toLowerCase()
            );
            if (match && (form.data.rate === '' || form.data.rate === undefined)) {
                form.setData('rate', match.rate || '');
            }
        }
    }, [rates]);

    // Step rate in form
    const stepRate = (delta) => {
        const current = parseInt(form.data.rate, 10) || 0;
        const next = Math.max(0, current + delta);
        form.setData('rate', next);
    };

    // When user selects a category from dropdown, auto-fill its current rate
    const handleCategorySelectChange = (catName) => {
        form.setData('vehicle_category', catName);
        const existing = (rates || []).find(
            (r) => r.vehicle_category?.toLowerCase() === catName.toLowerCase()
        );
        form.setData('rate', existing ? existing.rate : '');
    };

    // Submit rate update
    const handleSubmit = (e) => {
        e.preventDefault();
        const categoryName = form.data.vehicle_category?.trim();

        if (!categoryName) {
            toast.error('Please select a vehicle category.');
            return;
        }
        if (!form.data.rate || Number(form.data.rate) <= 0) {
            toast.error('Please enter a valid rate.');
            return;
        }

        setIsSubmitting(true);
        router.post('/finance/rent-a-car-rates', {
            vehicle_category: categoryName,
            rate: parseFloat(form.data.rate),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Rate for "${categoryName}" updated successfully.`);
                setIsSubmitting(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors || {})[0] || 'Failed to update rate.';
                toast.error(msg);
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Set / Update Category Rate Form */}
            {!isReadOnly && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Edit3 size={18} className="text-blue-700" />
                        <div>
                            <h3 className="text-sm font-black text-black">
                                Update Category Rate
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                                Select a vehicle category and update its daily rate.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                            {/* Vehicle Category Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-black mb-1">
                                    Vehicle Category <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={form.data.vehicle_category}
                                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                                    required
                                    className="w-full text-xs font-bold text-black rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2.5 px-3 bg-white"
                                >
                                    {availableCategories.map((cat) => {
                                        const existing = rates.find((r) => r.vehicle_category === cat);
                                        return (
                                            <option key={cat} value={cat}>
                                                {cat} {existing ? `(Current: LKR ${Number(existing.rate).toLocaleString()})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Rate with Stepper */}
                            <div>
                                <label className="block text-xs font-bold text-black mb-1 flex items-center justify-between">
                                    <span>Rate (LKR / Day) <span className="text-red-600">*</span></span>
                                    <span className="text-[10px] text-gray-500 font-bold">Per Day</span>
                                </label>
                                <div className="flex items-center rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                                    <button
                                        type="button"
                                        onClick={() => stepRate(-1000)}
                                        className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 active:bg-blue-100 border-r border-gray-200 transition shrink-0 select-none"
                                        title="Decrease 1,000"
                                    >
                                        <Minus size={13} className="stroke-[2.5]" />
                                    </button>
                                    <div className="relative flex-1 flex items-center min-w-0">
                                        <span className="absolute left-3 text-xs font-bold text-gray-500 pointer-events-none select-none">
                                            LKR
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="100"
                                            required
                                            placeholder="Enter Rate"
                                            value={form.data.rate}
                                            onChange={(e) => form.setData('rate', e.target.value)}
                                            className="w-full text-center py-2.5 pl-10 pr-3 text-xs font-black text-black border-0 focus:ring-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => stepRate(1000)}
                                        className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 active:bg-blue-100 border-l border-gray-200 transition shrink-0 select-none"
                                        title="Increase 1,000"
                                    >
                                        <Plus size={13} className="stroke-[2.5]" />
                                    </button>
                                </div>
                            </div>

                            {/* Update Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || form.processing}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition text-xs disabled:opacity-50"
                                >
                                    <Check size={14} className="stroke-[3]" />
                                    <span>{isSubmitting ? 'Updating...' : 'Update Rate'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Rates Table (Showing ONLY Vehicle Category and Rate) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <CarFront size={18} className="text-blue-700" />
                        <div>
                            <h3 className="text-sm font-black text-black">
                                Rent a Car Rates Table
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                                Current vehicle categories and daily rates.
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {rates.length} Categories
                    </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
                            <tr>
                                <th className="py-3 px-4 text-left w-16"># ID</th>
                                <th className="py-3 px-4 text-left">Vehicle Category</th>
                                <th className="py-3 px-4 text-right">Daily Rate (LKR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rates.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-gray-400 font-semibold">
                                        No rates found in rent_a_car_rates table.
                                    </td>
                                </tr>
                            ) : (
                                rates.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-slate-50/80"
                                    >
                                        {/* ID */}
                                        <td className="py-3 px-4 font-black text-gray-400 whitespace-nowrap">
                                            {item.id}
                                        </td>

                                        {/* Vehicle Category */}
                                        <td className="py-3 px-4 font-black text-gray-900 whitespace-nowrap">
                                            <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-900 text-xs font-black border border-blue-100">
                                                {item.vehicle_category}
                                            </span>
                                        </td>

                                        {/* Daily Rate */}
                                        <td className="py-3 px-4 text-right font-black text-gray-900 whitespace-nowrap text-sm">
                                            <span className="text-xs font-bold text-gray-400 mr-1.5">LKR</span>
                                            {Number(item.rate).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
