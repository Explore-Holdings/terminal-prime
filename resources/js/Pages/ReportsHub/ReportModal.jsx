import React, { useState, useEffect, useRef } from 'react';
import {
    XMarkIcon,
    PrinterIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ReportModal({ isOpen, onClose, config }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [range, setRange] = useState('today');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [summary, setSummary] = useState(null);

    const printRef = useRef();

    useEffect(() => {
        if (isOpen && config) {
            fetchData();
        }
    }, [isOpen, config, range]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { range };
            if (range === 'custom') {
                params.from = customFrom;
                params.to = customTo;
            }
            const response = await axios.get(config.endpoint, { params });
            setData(response.data.data || []);
            setSummary(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch report data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCustom = (e) => {
        e.preventDefault();
        if (customFrom && customTo) {
            fetchData();
        }
    };

    const handleExportExcel = () => {
        if (!data.length) return;

        const headers = config.columns.map(c => c.label);
        const rows = data.map(row => config.columns.map(c => {
            let val = row[c.key];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') {
                val = val.replace(/"/g, '""');
                if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                    val = `"${val}"`;
                }
            }
            return val;
        }));

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${config.title.replace(/\s+/g, '_')}_${range}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 print:hidden shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-md`}>
                        <config.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#0f1d45] tracking-tight">{config.title}</h2>
                        <p className="text-sm text-gray-500 font-medium">{config.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        disabled={loading || data.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={loading || data.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Export PDF
                    </button>
                    <div className="w-px h-8 bg-gray-200 mx-1"></div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-6 shrink-0 print:hidden z-10 shadow-sm relative">
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    {['today', 'week', 'month', 'custom'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                                range === r
                                    ? 'bg-white text-[#0f1d45] shadow-sm ring-1 ring-gray-200/50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : r}
                        </button>
                    ))}
                </div>

                {range === 'custom' && (
                    <form onSubmit={handleApplyCustom} className="flex items-center gap-3 animate-fadeIn">
                        <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400 text-sm font-bold">to</span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-[#0f1d45] text-white text-sm font-bold shadow-md hover:bg-[#1a2d6b] transition-colors"
                        >
                            Apply
                        </button>
                    </form>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 relative bg-slate-50/50">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 print:hidden">
                        <div className="w-12 h-12 border-4 border-[#0f1d45]/20 border-t-[#0f1d45] rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm font-bold text-gray-500 tracking-wider">GENERATING REPORT...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium shadow-sm">
                        {error}
                    </div>
                ) : (
                    <div ref={printRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:rounded-none max-w-[1400px] mx-auto">
                        
                        {/* Print Only Header */}
                        <div className="hidden print:block mb-8 border-b-2 border-gray-800 pb-4">
                            <h1 className="text-3xl font-black text-gray-900">{config.title}</h1>
                            <p className="text-gray-600 mt-2 font-medium">Generated on {new Date().toLocaleString()}</p>
                            <p className="text-gray-600 font-medium capitalize">Date Range: {range === 'custom' ? `${customFrom} to ${customTo}` : range}</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-gray-200 print:bg-transparent print:border-b-2 print:border-gray-800">
                                        {config.columns.map((col, i) => (
                                            <th key={i} className={`px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}>
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                    {data.length > 0 ? (
                                        data.map((row, i) => (
                                            <tr key={i} className="hover:bg-blue-50/30 transition-colors print:hover:bg-transparent">
                                                {config.columns.map((col, j) => (
                                                    <td key={j} className={`px-4 py-3 text-sm text-gray-700 ${col.align === 'right' ? 'text-right font-medium' : ''} ${col.bold ? 'font-bold text-gray-900' : ''}`}>
                                                        {col.format ? col.format(row[col.key], row) : row[col.key] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={config.columns.length} className="px-4 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <MagnifyingGlassIcon className="w-10 h-10 mb-3 text-gray-300" />
                                                    <p className="font-semibold text-gray-500">No data found for this period</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {summary && config.summaryRow && data.length > 0 && (
                                    <tfoot className="bg-slate-50 border-t-2 border-gray-200 print:bg-transparent print:border-t-2 print:border-gray-800">
                                        <tr>
                                            {config.summaryRow(summary).map((cell, i) => (
                                                <td key={i} colSpan={cell.colSpan || 1} className={`px-4 py-3.5 text-sm font-black text-gray-900 ${cell.align === 'right' ? 'text-right' : ''}`}>
                                                    {cell.value}
                                                </td>
                                            ))}
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .animate-fadeIn { animation: none; }
                    .fixed.inset-0 { position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: visible; background: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; visibility: visible; }
                    table, table * { visibility: visible; }
                    .overflow-x-auto { overflow: visible !important; }
                    .overflow-auto { overflow: visible !important; }
                    .bg-slate-50\\/50 { background: white !important; }
                    .flex-1 { flex: none; height: auto; }
                }
            `}</style>
        </div>
    );
}
