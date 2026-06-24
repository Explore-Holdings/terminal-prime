function Skeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-36 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-28 mb-5" />
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-100 rounded-xl h-24" />
                <div className="bg-gray-100 rounded-xl h-24" />
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full" />
        </div>
    );
}

export default function DriverAvailability({ data, loading = false }) {
    if (loading) return <Skeleton />;

    if (!data) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-center text-gray-400 text-sm">
                No driver data available.
            </div>
        );
    }

    const { onDuty, offDuty, total, onDutyPct, offDutyPct } = data;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800">Driver Availability</h3>
                <p className="text-xs text-gray-400 mt-0.5">{total} drivers registered</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-600">{onDuty}</p>
                    <p className="text-xs font-semibold text-emerald-700 mt-1">On Duty</p>
                    <p className="text-xs text-emerald-500 mt-0.5">{onDutyPct}% of fleet</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-gray-400">{offDuty}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1">Off Duty</p>
                    <p className="text-xs text-gray-400 mt-0.5">{offDutyPct}% of fleet</p>
                </div>
            </div>

            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${onDutyPct}%` }}
                />
            </div>
            <div className="flex justify-between mt-1.5">
                <span className="text-xs text-emerald-600 font-medium">● On Duty {onDutyPct}%</span>
                <span className="text-xs text-gray-400 font-medium">Off Duty {offDutyPct}% ●</span>
            </div>
        </div>
    );
}
