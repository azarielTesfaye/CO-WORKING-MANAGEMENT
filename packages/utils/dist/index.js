"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.isSameDay = isSameDay;
exports.isOverlapping = isOverlapping;
exports.isTimeSlotAvailable = isTimeSlotAvailable;
exports.saveToLocal = saveToLocal;
exports.loadFromLocal = loadFromLocal;
// Date helpers
function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}
function isOverlapping(a, b) {
    return a.start < b.end && a.end > b.start;
}
function isTimeSlotAvailable(desired, existing) {
    return !existing.some(ex => isOverlapping(desired, ex));
}
// Storage helpers (localStorage)
function saveToLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function loadFromLocal(key, defaultValue) {
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
