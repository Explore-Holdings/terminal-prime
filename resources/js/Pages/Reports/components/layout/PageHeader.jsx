import { Download, SlidersHorizontal, Calendar } from 'lucide-react';
import { todayDisplay } from '../../utils/formatDate';

const PRESET_RANGES = [
    { value: 'today', label: 'Today' },
    { value: 'week',  label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom' },
];

export default function PageHeader({
    userName = 'Admin',
    activeRange,
    customFrom,
    customTo,
    onRangeChange,
    onCustomFromChange,
    onCustomToChange,
}) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Row 1: greeting + action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Hello, {userName}!</h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {todayDisplay()}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Date-range preset pills */}
                    <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1 gap-0.5">
                        {PRESET_RANGES.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => onRangeChange(value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeRange === value
                                        ? 'bg-[#2563EB] text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Filters button */}
                    {/* <button
                        type="button"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button> */}

                    {/* Export button */}
                    {/* <button
                        type="button"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button> */}
                </div>
            </div>

            {activeRange === 'custom' && (
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 w-fit">
                    <span className="text-xs font-semibold text-gray-500 shrink-0">Date range:</span>
                    <input
                        type="date"
                        value={customFrom}
                        onChange={e => onCustomFromChange(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={e => onCustomToChange(e.target.value)}
                        min={customFrom}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}
        </div>
    );
}
