/**
 * Terminal Prime - Security Lockdown
 * 
 * Protects system integrity by disabling:
 * - Right-click context menu
 * - Inspect Element & DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
 * - View Source (Ctrl+U)
 * - Save Page (Ctrl+S)
 * - Clipboard operations (Copy, Cut, Paste & Ctrl+C/V/X)
 * - Drag and drop of assets
 * 
 * NOTE: For users with the 'admin' role, all restrictions are disabled,
 * enabling full access to copy/paste, context menu, and inspect/developer tools.
 */

import { router } from '@inertiajs/react';

let currentRole = null;

function detectUserRole() {
    try {
        // 1. Check router page props if available
        if (typeof router !== 'undefined' && router.page?.props?.auth?.user?.role) {
            return String(router.page.props.auth.user.role).toLowerCase();
        }

        // 2. Check initial data-page in DOM
        if (typeof document !== 'undefined') {
            const appEl = document.getElementById('app');
            if (appEl && appEl.dataset?.page) {
                const pageData = JSON.parse(appEl.dataset.page);
                if (pageData?.props?.auth?.user?.role) {
                    return String(pageData.props.auth.user.role).toLowerCase();
                }
            }
        }
    } catch (e) {
        // silent fail
    }
    return currentRole;
}

export function isAdminUser() {
    const role = detectUserRole();
    return role === 'admin';
}

function updateBodySelection(isAdmin) {
    if (typeof document === 'undefined' || !document.body) return;
    if (isAdmin) {
        document.body.classList.add('role-admin');
        document.body.style.userSelect = 'auto';
        document.body.style.webkitUserSelect = 'auto';
    } else {
        document.body.classList.remove('role-admin');
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
    }
}

export function initSecurityLockdown() {
    if (typeof document === 'undefined') return;

    // Listen to Inertia navigation events to keep role and selection synced
    if (typeof router !== 'undefined' && router.on) {
        router.on('navigate', (event) => {
            const role = event.detail?.page?.props?.auth?.user?.role;
            if (role) {
                currentRole = String(role).toLowerCase();
            } else {
                currentRole = null;
            }
            updateBodySelection(currentRole === 'admin');
        });
    }

    // Initial check on load
    currentRole = detectUserRole();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateBodySelection(isAdminUser());
        });
    } else {
        updateBodySelection(isAdminUser());
    }

    // 1. Block Right-Click Context Menu (Allowed for admin)
    document.addEventListener('contextmenu', (e) => {
        if (isAdminUser()) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // 2. Block DevTools, Inspect Element, View Source & Shortcut Combinations (Allowed for admin)
    document.addEventListener('keydown', (e) => {
        if (isAdminUser()) return;

        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        const key = (e.key || '').toUpperCase();
        const keyCode = e.keyCode || e.which;

        // F12 -> DevTools
        if (e.key === 'F12' || keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+Shift+I / Cmd+Opt+I (Developer Tools)
        // Ctrl+Shift+J / Cmd+Opt+J (Console)
        // Ctrl+Shift+C / Cmd+Opt+C (Inspect Element)
        if (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'J' || key === 'C' || keyCode === 73 || keyCode === 74 || keyCode === 67)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+U / Cmd+U (View Page Source)
        if (isCtrlOrMeta && (key === 'U' || keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+S / Cmd+S (Save Page)
        if (isCtrlOrMeta && (key === 'S' || keyCode === 83)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+C (Copy), Ctrl+X (Cut), Ctrl+V (Paste)
        if (isCtrlOrMeta && (key === 'C' || key === 'X' || key === 'V' || keyCode === 67 || keyCode === 88 || keyCode === 86)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    // 3. Block Native Clipboard Copy, Cut & Paste Events (Allowed for admin)
    document.addEventListener('copy', (e) => {
        if (isAdminUser()) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    document.addEventListener('cut', (e) => {
        if (isAdminUser()) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    document.addEventListener('paste', (e) => {
        if (isAdminUser()) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // 4. Block Dragging Images / Content (Allowed for admin)
    document.addEventListener('dragstart', (e) => {
        if (isAdminUser()) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);
}
