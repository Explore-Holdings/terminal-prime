import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const { name, value, pct } = payload[0].payload;
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-sm">
            <p className="font-semibold text-gray-800">{name}</p>
            <p className="text-gray-500">{value} trips &middot; {pct}%</p>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-28 mb-4" />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gray-200" />
            </div>
            <div className="space-y-3 mt-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                            <div className="h-3 bg-gray-200 rounded w-20" />
                        </div>
                        <div className="h-3 bg-gray-100 rounded w-12" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StatusDonut({ data, total, loading = false }) {
    if (loading) return <Skeleton />;

    const isEmpty = !data?.length || data.every(d => d.value === 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col">
            <div className="mb-2">
                <h3 className="text-sm font-bold text-gray-800">Trip Status Breakdown</h3>
                <p className="text-xs text-gray-400 mt-0.5">Distribution for selected period</p>
            </div>

            {isEmpty ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    No trip data for this period.
                </div>
            ) : (
                <>
                    <div className="relative h-[210px]">
                        <ResponsiveContainer width="100%" height={210}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {data.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-gray-800">{total.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 mt-0.5">Total Trips</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 mt-3">
                        {data.map(item => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-gray-600">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-semibold text-gray-800">{item.value}</span>
                                    <span className="text-gray-400 w-9 text-right">{item.pct}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
