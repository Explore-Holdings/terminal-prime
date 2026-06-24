export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatShortDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
    });
}

export function todayDisplay() {
    return new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
