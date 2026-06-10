import { Head, useForm } from '@inertiajs/react';

export default function Show({ trip, alreadySubmitted = false }) {
    const form = useForm({
        journey_rating: '',
        driver_rating: '',
        driver_charged_extra: false,
        extra_amount: '',
        driver_was_polite: true,
        vehicle_was_clean: true,
        felt_safe: true,
        comments: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.post(`/survey/${trip.id}`, {
            preserveScroll: true,
        });
    };

    if (alreadySubmitted) {
        return (
            <Page>
                <div className="bg-white rounded-2xl shadow p-8 text-center max-w-xl w-full">
                    <h1 className="text-2xl font-bold text-green-700">
                        Thank you!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Your feedback has already been submitted.
                    </p>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <Head title="Customer Feedback" />

            <form
                onSubmit={submit}
                className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl w-full"
            >
                <div className="text-center border-b pb-5 mb-5">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Terminal Prime
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Customer Journey Feedback
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                        Hello {trip.customer?.name ?? 'Customer'}, please rate your journey.
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5 text-sm text-gray-700">
                    <strong>Rating Guide:</strong> 1 = Fair, 2 = Average, 3 = Good, 4 = Very Good, 5 = Excellent
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Question title="How was your entire journey?">
                        <Rating
                            value={form.data.journey_rating}
                            onChange={(value) => form.setData('journey_rating', value)}
                        />
                        {form.errors.journey_rating && (
                            <Error text={form.errors.journey_rating} />
                        )}
                    </Question>

                    <Question title="How would you rate the driver?">
                        <Rating
                            value={form.data.driver_rating}
                            onChange={(value) => form.setData('driver_rating', value)}
                        />
                    </Question>

                    <Question title="Did the driver charge any extra amount?">
                        <YesNo
                            value={form.data.driver_charged_extra}
                            onChange={(value) => form.setData('driver_charged_extra', value)}
                        />

                        {form.data.driver_charged_extra && (
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Enter extra amount"
                                value={form.data.extra_amount}
                                onChange={(e) => form.setData('extra_amount', e.target.value)}
                                className="mt-3 w-full border rounded-lg px-4 py-2"
                            />
                        )}

                        {form.errors.extra_amount && (
                            <Error text={form.errors.extra_amount} />
                        )}
                    </Question>

                    <Question title="Was the driver polite and helpful?">
                        <YesNo
                            value={form.data.driver_was_polite}
                            onChange={(value) => form.setData('driver_was_polite', value)}
                        />
                    </Question>

                    <Question title="Was the vehicle clean and comfortable?">
                        <YesNo
                            value={form.data.vehicle_was_clean}
                            onChange={(value) => form.setData('vehicle_was_clean', value)}
                        />
                    </Question>

                    <Question title="Did you feel safe during the journey?">
                        <YesNo
                            value={form.data.felt_safe}
                            onChange={(value) => form.setData('felt_safe', value)}
                        />
                    </Question>
                </div>

                <Question title="Any comments or suggestions?">
                    <textarea
                        rows="4"
                        value={form.data.comments}
                        onChange={(e) => form.setData('comments', e.target.value)}
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Write your feedback here..."
                    />
                </Question>

                <button
                    disabled={form.processing}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                    {form.processing ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </Page>
    );
}

function Page({ children }) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {children}
        </div>
    );
}

function Question({ title, children }) {
    return (
        <div className="bg-gray-50 border rounded-xl p-4">
            <label className="block font-semibold text-gray-800 mb-3">
                {title}
            </label>
            {children}
        </div>
    );
}

function Rating({ value, onChange }) {
    const labels = {
        1: 'Fair',
        2: 'Average',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent',
    };

    return (
        <div>
            <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((rate) => (
                    <button
                        key={rate}
                        type="button"
                        onClick={() => onChange(rate)}
                        className={`w-10 h-10 rounded-full font-bold border ${
                            Number(value) === rate
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                    >
                        {rate}
                    </button>
                ))}
            </div>

            {value && (
                <p className="text-xs text-gray-500 mt-2">
                    Selected: <strong>{value} - {labels[value]}</strong>
                </p>
            )}
        </div>
    );
}

function YesNo({ value, onChange }) {
    return (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`px-5 py-2 rounded-lg font-semibold ${
                    value === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                }`}
            >
                Yes
            </button>

            <button
                type="button"
                onClick={() => onChange(false)}
                className={`px-5 py-2 rounded-lg font-semibold ${
                    value === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                }`}
            >
                No
            </button>
        </div>
    );
}

function Error({ text }) {
    return <p className="text-red-600 text-sm mt-1">{text}</p>;
}