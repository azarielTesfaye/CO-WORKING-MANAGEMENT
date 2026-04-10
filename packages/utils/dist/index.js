// Date helpers
export function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
export function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
export function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}
export function isOverlapping(a, b) {
    return a.start < b.end && a.end > b.start;
}
export function isTimeSlotAvailable(desired, existing) {
    return !existing.some(ex => isOverlapping(desired, ex));
}
// Storage helpers (localStorage)
export function saveToLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
export function loadFromLocal(key, defaultValue) {
    const raw = localStorage.getItem(key);
    if (!raw)
        return defaultValue;
    try {
        return JSON.parse(raw);
    }
    catch {
        return defaultValue;
    }
}
