import { TrendingUp, TrendingDown } from 'lucide-react';

function Skeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="w-11 h-11 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
    );
}

export default function KpiCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    iconColor,
    trend,
    loading = false,
}) {
    if (loading) return <Skeleton />;

    const isPositive = trend >= 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-500">{title}</p>
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
            </div>

            <div>
                <p className="text-2xl font-bold text-gray-800 leading-tight">{value ?? '—'}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>

            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isPositive
                        ? <TrendingUp className="w-3.5 h-3.5" />
                        : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(trend)}% vs previous period
                </div>
            )}
        </div>
    );
}
