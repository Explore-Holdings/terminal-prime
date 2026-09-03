import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

function getOrCreateDeviceId() {
    try {
        let id = localStorage.getItem('terminal_device_id');
        if (!id) {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                id = crypto.randomUUID().toUpperCase();
            } else {
                id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16).toUpperCase();
                });
            }
            localStorage.setItem('terminal_device_id', id);
        }
        return id;
    } catch (e) {
        return null;
    }
}

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [deviceId] = useState(() => (typeof window !== 'undefined' ? getOrCreateDeviceId() : ''));
    const coordsRef = useRef({ latitude: null, longitude: null });

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        device_id: typeof window !== 'undefined' ? getOrCreateDeviceId() : '',
        latitude: null,
        longitude: null,
    });

    const [inactivityNotice, setInactivityNotice] = useState(false);

    useEffect(() => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('reason') === 'inactivity' || sessionStorage.getItem('logout_reason') === 'inactivity') {
                setInactivityNotice(true);
                sessionStorage.removeItem('logout_reason');
            }
        } catch (e) {}

        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (pos?.coords) {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        coordsRef.current = { latitude: lat, longitude: lon };
                        setData((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lon,
                        }));
                    }
                },
                () => {
                    // Silently ignore if blocked or timeout
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
            );
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();

        const currentDeviceId = getOrCreateDeviceId();
        data.device_id = currentDeviceId;

        if (coordsRef.current.latitude) {
            data.latitude = coordsRef.current.latitude;
            data.longitude = coordsRef.current.longitude;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Airport Counter Login" />

            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(2, 6, 23, 0.68), rgba(2, 6, 23, 0.68)), url('/assets/images/airport-login-bg-1.jpg')",
                }}
            >
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-7">
                            <div className="mx-auto h-14 w-14 rounded-2xl overflow-hidden mb-3">
                                <img
                                    src="/assets/images/logo.png"
                                    alt="Airport"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <h1 className="text-3xl font-bold text-slate-900">
                                TERMINAL PRIME
                            </h1>

                            <p className="text-sm text-slate-500">
                                Airport Counter Login
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        {inactivityNotice && (
                            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs font-semibold text-amber-800 flex items-center gap-2 shadow-sm">
                                <span className="text-base">⏱️</span>
                                <span>You have been logged out due to 10 minutes of inactivity.</span>
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
                                    className="w-full rounded-xl border-slate-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter password"
                                        className="w-full rounded-xl border-slate-300 px-4 py-3 pr-20 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3 text-sm font-semibold text-blue-700"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>

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

                                {/* {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                                    >
                                        Forgot?
                                    </Link>
                                )} */}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-blue-900 px-4 py-3 text-white font-semibold shadow-lg hover:bg-blue-800 active:scale-[0.98] transition disabled:opacity-50"
                            >
                                {processing ? 'Signing in...' : 'Log in'}
                            </button>

                            {/* {deviceId && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="font-semibold uppercase tracking-wider">Terminal ID</span>
                                    <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[220px]" title={deviceId}>
                                        {deviceId}
                                    </span>
                                </div>
                            )} */}
                        </form>
                    </div>

                    <p className="text-center text-xs text-white/80 mt-4">
                        © {new Date().getFullYear()} Explore Holdings IT Department
                    </p>
                </div>
            </div>
        </>
    );
}