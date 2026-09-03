import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

/**
 * Hook to automatically log out users after a specified period of inactivity.
 * 
 * @param {number} timeoutMs Total inactivity duration before forced logout (default: 10 mins = 600,000 ms)
 * @param {number} warningMs Duration before showing warning modal (default: 9 mins = 540,000 ms)
 */
export function useIdleTimeout(timeoutMs = 10 * 60 * 1000, warningMs = 9 * 60 * 1000) {
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(60);

    const lastActivityRef = useRef(Date.now());
    const isLoggedOutRef = useRef(false);

    // Perform the logout
    const performLogout = useCallback(() => {
        if (isLoggedOutRef.current) return;
        isLoggedOutRef.current = true;

        try {
            sessionStorage.setItem('logout_reason', 'inactivity');
        } catch (e) {
            // Ignore if sessionStorage is unavailable
        }

        router.post('/logout', {}, {
            onFinish: () => {
                window.location.href = '/login?reason=inactivity';
            },
        });
    }, []);

    // Reset timer on user interaction
    const resetTimer = useCallback(() => {
        if (isLoggedOutRef.current) return;

        lastActivityRef.current = Date.now();
        if (isWarningVisible) {
            setIsWarningVisible(false);
        }
    }, [isWarningVisible]);

    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        // Throttle activity event handler so it doesn't fire hundreds of times per second
        let throttleTimeout = null;
        const handleUserActivity = () => {
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    throttleTimeout = null;
                    resetTimer();
                }, 1000);
            }
        };

        events.forEach((eventName) => {
            window.addEventListener(eventName, handleUserActivity, { passive: true });
        });

        // Interval to check elapsed idle time every second
        const checkInterval = setInterval(() => {
            if (isLoggedOutRef.current) return;

            const now = Date.now();
            const elapsed = now - lastActivityRef.current;

            if (elapsed >= timeoutMs) {
                // 10 minutes exceeded: force logout
                clearInterval(checkInterval);
                performLogout();
            } else if (elapsed >= warningMs) {
                // 9 minutes exceeded: show countdown warning
                const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
                setSecondsRemaining(remaining);
                setIsWarningVisible(true);
            } else {
                if (isWarningVisible) {
                    setIsWarningVisible(false);
                }
            }
        }, 1000);

        return () => {
            events.forEach((eventName) => {
                window.removeEventListener(eventName, handleUserActivity);
            });
            if (throttleTimeout) clearTimeout(throttleTimeout);
            clearInterval(checkInterval);
        };
    }, [resetTimer, performLogout, timeoutMs, warningMs, isWarningVisible]);

    return {
        isWarningVisible,
        secondsRemaining,
        stayLoggedIn: resetTimer,
    };
}
