import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function UploadSlipModal({ uploadSlipModal, setUploadSlipModal }) {
    if (!uploadSlipModal) return null;

    const trip = uploadSlipModal.trip || {};
    const customer = uploadSlipModal.customer || trip.customer || {};
    const agent = customer.agent || uploadSlipModal.agent || {};
    const originalCurrency = agent.new_currency ?? agent.currency ?? 'LKR';
    const originalAmount = Number(customer.paid_amount ?? uploadSlipModal.paid_amount ?? 0);
    const amountInLkr = Number(uploadSlipModal.amountInLkr ?? uploadSlipModal.received_amount ?? 0);
    const displayTitle = uploadSlipModal.displayId || (uploadSlipModal.trip_id ? `Trip #${uploadSlipModal.trip_id}` : `Ref #${uploadSlipModal.id}`);

    let paymentNotes = [];
    try {
        paymentNotes = Array.isArray(customer?.payment_notes)
            ? customer.payment_notes
            : typeof customer?.payment_notes === 'string'
                ? JSON.parse(customer.payment_notes || '[]')
                : [];
    } catch (e) {
        paymentNotes = [];
    }

    // Upload form state supporting multiple slips
    const uploadForm = useForm({ uploads: [{ file: null, description: '' }] });

    const handleAddSlip = () => {
        uploadForm.setData('uploads', [...uploadForm.data.uploads, { file: null, description: '' }]);
    };

    const handleRemoveSlip = (index) => {
        const newUploads = uploadForm.data.uploads.filter((_, i) => i !== index);
        uploadForm.setData('uploads', newUploads);
    };

    const handleUploadChange = (index, field, value) => {
        const newUploads = [...uploadForm.data.uploads];
        newUploads[index][field] = value;
        uploadForm.setData('uploads', newUploads);
    };

    const handleUpload = () => {
        if (uploadForm.data.uploads.some(u => !u.file)) {
            toast.error('Please select a file for all upload fields');
            return;
        }

        let uploadRoute;
        if (uploadSlipModal.type === 'outside_vehicle') {
            uploadRoute = route('finance.outsource-vehicles.upload-slips', uploadSlipModal.id);
        } else if (uploadSlipModal.type === 'rent_a_car') {
            uploadRoute = route('finance.customers.upload-slips', uploadSlipModal.id);
        } else {
            uploadRoute = route('finance.trip-finances.upload-slips', uploadSlipModal.id);
        }
        
        uploadForm.post(uploadRoute, {
            onSuccess: () => {
                toast.success('Payment slips uploaded successfully');
                setUploadSlipModal(null);
            },
            onError: () => {
                toast.error('Failed to upload slips. Please try again.');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setUploadSlipModal(null)}>
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f5f6fa]/50 shrink-0">
                    <h3 className="text-lg font-black text-[#0f1d45]">Upload Slip for {displayTitle}</h3>
                    <button onClick={() => setUploadSlipModal(null)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Received Amount</p>
                            <p className="text-3xl font-black text-emerald-600">
                                {originalCurrency} {originalAmount.toLocaleString()}
                            </p>
                            <p className="text-sm font-semibold text-gray-400 mt-1">
                                LKR {amountInLkr.toLocaleString()}
                            </p>

                            {/* Payment Breakdown */}
                            {paymentNotes.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Breakdown</p>
                                    <div className="space-y-3">
                                        {paymentNotes.map((p, pi) => (
                                            <div key={pi} className="flex flex-col gap-2 text-sm">
                                                <div>
                                                    <span className={`px-2.5 py-1 rounded-md font-bold uppercase ${p.method === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {p.method}
                                                    </span>
                                                </div>
                                                {p.method === 'Cash' && Array.isArray(p.notes) && p.notes.map((n, ni) => (
                                                    <div key={ni} className="bg-slate-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 font-semibold inline-block">
                                                        💵 {n.amount} x {n.count} ({n.currency || p.currency})
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dynamic Upload Fields */}
                        <div className="md:col-span-8 border-l-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-[#0f1d45]">Documents & Slips</h4>
                                <button 
                                    onClick={handleAddSlip}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md transition"
                                >
                                    + Add Another Slip
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {uploadForm.data.uploads.map((upload, index) => (
                                    <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-xl relative flex flex-col">
                                        {uploadForm.data.uploads.length > 1 && (
                                            <button 
                                                onClick={() => handleRemoveSlip(index)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                                                title="Remove slip"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        )}
                                        <div className="mb-3 flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 w-11/12">Upload File {index + 1}</label>
                                            <input
                                                type="file"
                                                onChange={e => handleUploadChange(index, 'file', e.target.files[0])}
                                                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-lg bg-white p-1"
                                            />
                                        </div>
                                        <div className="mt-auto">
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description (optional)</label>
                                            <textarea
                                                value={upload.description}
                                                onChange={e => handleUploadChange(index, 'description', e.target.value)}
                                                rows="2"
                                                placeholder="e.g. Deposit slip"
                                                className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={() => setUploadSlipModal(null)}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploadForm.processing}
                        className="px-6 py-2.5 bg-[#0f1d45] text-white text-sm font-bold rounded-xl hover:bg-black active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {uploadForm.processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            `Upload ${uploadForm.data.uploads.length} File${uploadForm.data.uploads.length > 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
