import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { useMemo } from 'react';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

export default function AccountantIndex({ receivedFinances = [] }) {
    const totalReceived = useMemo(() => {
        return receivedFinances.reduce((acc, tf) => acc + Number(tf.received_amount || 0), 0);
    }, [receivedFinances]);

    return (
        <AppSidebarLayout title="Accountant">
            <Head title="Accountant" />
            
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#0f1d45]">Accountant Dashboard</h1>
                <p className="text-sm font-medium text-gray-400 mt-1">Trips and amounts received from the Counter Manager</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Received Records</p>
                    <p className="text-2xl font-black leading-tight text-[#0f1d45] mt-1.5">{receivedFinances.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Amount Received</p>
                    <p className="text-2xl font-black leading-tight text-emerald-600 mt-1.5">LKR {fmt(totalReceived)}</p>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black text-[#0f1d45]">Received Finances</h2>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#f5f6fa]">
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Trip ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Received At</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Payment Breakdown</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Received By</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Amount (LKR)</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {receivedFinances.length > 0 ? (
                                receivedFinances.map((tf) => {
                                    let paymentNotes = [];
                                    try {
                                        const raw = tf.trip?.customer?.payment_notes;
                                        paymentNotes = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
                                    } catch (e) {}

                                    return (
                                        <tr key={tf.id} className="hover:bg-[#f5f6fa]/50 transition">
                                            <td className="px-4 py-3 font-bold text-[#0f1d45]">#{tf.trip_id}</td>
                                            <td className="px-4 py-3 text-gray-600 font-medium">{fmtDate(tf.received_at)}</td>
                                            <td className="px-4 py-3">
                                                {paymentNotes.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {paymentNotes.map((p, pi) => (
                                                            <div key={pi} className="flex flex-wrap items-center gap-1 text-[10px]">
                                                                <span className={`px-1 py-0.5 rounded font-bold uppercase ${p.method === 'Cash' ? 'bg-emerald-100 text-black' : 'bg-blue-100 text-black'}`}>
                                                                    {p.method}
                                                                </span>
                                                                {p.method === 'Cash' && Array.isArray(p.notes) && p.notes.map((n, ni) => (
                                                                    <span key={ni} className="bg-slate-100 text-black px-1 py-0.5 rounded border font-semibold">
                                                                        💵 {n.amount} x {n.count} ({n.currency || p.currency})
                                                                    </span>
                                                                ))}
                                                                {p.method !== 'Cash' && p.amount && (
                                                                    <span className="font-semibold text-gray-600 ml-1">
                                                                        {p.currency} {fmt(p.amount)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">No breakdown</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                    {tf.receiver?.name || 'System'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-emerald-600">
                                                LKR {fmt(tf.received_amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    className="rounded bg-[#0f1d45] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1a2d5c] active:scale-95 transition-transform shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-medium bg-[#f5f6fa]/30">
                                        No received records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
