import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
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

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const coordsRef = useRef({ latitude: null, longitude: null });
    const [inactivityNotice, setInactivityNotice] = useState(false);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        email: '',
        password: '',
        remember: false,
        device_id: typeof window !== 'undefined' ? getOrCreateDeviceId() : '',
        latitude: null,
        longitude: null,
    });

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
                        setData((prev) => ({ ...prev, latitude: lat, longitude: lon }));
                    }
                },
                () => {},
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
            );
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (processing) return;

        // Make sure the latest device id / coordinates are sent with the request
        transform((d) => ({
            ...d,
            device_id: getOrCreateDeviceId(),
            latitude: coordsRef.current.latitude ?? d.latitude,
            longitude: coordsRef.current.longitude ?? d.longitude,
        }));

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Airport Counter - Europcar Sri Lanka" />

            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(2, 6, 23, 0.65), rgba(2, 6, 23, 0.65)), url('/assets/images/airport-login-bg-2.jpg')",
                }}
            >
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-7">
                            <div className="flex justify-center mb-4">
                                <img
                                    src="/assets/images/logo-europcar.png"
                                    alt="Europcar"
                                    className="h-12 w-auto rounded-lg shadow-sm object-contain"
                                />
                            </div>

                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Airport Counter - Europcar Sri Lanka
                            </h1>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
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
                                    className="w-full rounded-xl border-slate-300 px-4 py-3 shadow-sm focus:border-[#00703c] focus:ring-2 focus:ring-[#00703c]/20 outline-none transition"
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
                                        className="w-full rounded-xl border-slate-300 px-4 py-3 pr-20 shadow-sm focus:border-[#00703c] focus:ring-2 focus:ring-[#00703c]/20 outline-none transition"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3 text-xs font-bold uppercase tracking-wider text-[#00703c] hover:text-[#00522c] transition"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="text-[#00703c] focus:ring-[#00703c] rounded border-slate-300"
                                    />
                                    <span className="ms-2 text-sm text-slate-600">
                                        Remember me
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-[#00703c] hover:bg-[#005b31] active:bg-[#004a28] px-4 py-3 text-white font-semibold shadow-lg shadow-[#00703c]/25 hover:shadow-xl hover:shadow-[#00703c]/35 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {processing ? 'Signing in...' : 'Log in'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-white/80 mt-4">
                        © {new Date().getFullYear()} Europcar Sri Lanka • Explore Holdings IT Department
                    </p>
                </div>
            </div>
        </>
    );
}