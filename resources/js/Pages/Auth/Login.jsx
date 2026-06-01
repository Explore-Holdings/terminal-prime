import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Airport Counter Login" />

            <div className="min-h-screen flex bg-slate-950">
                {/* Left Side */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black"></div>

                    <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
                        <div>
                            <div className="inline-flex items-center gap-3 mb-8">
                                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-bold">
                                    ✈
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        Airport Counter
                                    </h1>
                                    <p className="text-sm text-blue-200">
                                        Terminal Operations System
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-5xl font-bold leading-tight">
                                Driver & Counter <br />
                                Management Portal
                            </h2>

                            <p className="mt-6 text-lg text-slate-300 max-w-md">
                                Secure access for airport counter staff to manage
                                drivers, registrations, vehicles, documents, and approvals.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Right Side Login */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                    <div className="w-full max-w-md">
                        <div className="lg:hidden text-center mb-8">
                            <div className="mx-auto h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center text-3xl text-white mb-3">
                                ✈
                            </div>
                            <h1 className="text-2xl font-bold text-white">
                                Airport Counter
                            </h1>
                            <p className="text-slate-400">
                                Terminal Operations System
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-slate-900">
                                    Welcome Back
                                </h2>
                                <p className="text-slate-500 mt-2">
                                    Sign in to continue to your counter dashboard.
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="counter@airport.lk"
                                        className="w-full rounded-lg border-slate-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter password"
                                        className="w-full rounded-lg border-slate-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData('remember', e.target.checked)
                                            }
                                        />
                                        <span className="ms-2 text-sm text-slate-600">
                                            Remember me
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-lg bg-blue-700 px-4 py-3 text-white font-semibold shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {processing ? 'Signing in...' : 'Log in to Counter'}
                                </button>
                            </form>
                        </div>

                        <p className="text-center text-sm text-slate-500 mt-6">
                        © {new Date().getFullYear()} Explore Holdings IT Department. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}