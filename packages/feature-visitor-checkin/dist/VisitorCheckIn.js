import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Button, Badge } from '@cowork/ui-components';
const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 transition-[border-color,box-shadow] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15';
const PURPOSES = ['Meeting', 'Delivery', 'Interview', 'Other'];
/** Single UI feature: visitor self check-in at reception (client-side only). */
export const VisitorCheckIn = () => {
    const [visitorName, setVisitorName] = useState('');
    const [company, setCompany] = useState('');
    const [hostName, setHostName] = useState('');
    const [purpose, setPurpose] = useState('Meeting');
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const reset = () => {
        setVisitorName('');
        setCompany('');
        setHostName('');
        setPurpose('Meeting');
        setError(null);
        setSubmitted(false);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const name = visitorName.trim();
        const host = hostName.trim();
        if (!name || !host) {
            setError('Visitor name and host name are required.');
            return;
        }
        setError(null);
        setSubmitted(true);
    };
    if (submitted) {
        return (_jsx(Card, { title: "You are checked in", description: "Show this screen at reception if asked. This demo does not send data to a server.", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Badge, { color: "green", children: "Arrival" }), _jsx("span", { className: "text-sm font-semibold text-slate-900", children: visitorName.trim() }), company.trim() ? (_jsxs("span", { className: "text-sm text-slate-600", children: ["\u00B7 ", company.trim()] })) : null] }), _jsxs("dl", { className: "grid gap-2 text-sm text-slate-600 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Visiting" }), _jsx("dd", { className: "font-medium text-slate-900", children: hostName.trim() })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Purpose" }), _jsx("dd", { className: "font-medium text-slate-900", children: purpose })] })] }), _jsx(Button, { type: "button", variant: "secondary", onClick: reset, children: "Register another visitor" })] }) }));
    }
    return (_jsx(Card, { title: "Visitor check-in", description: "For guests arriving on site. Filled data stays in this browser until you submit.", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [error ? (_jsx("p", { className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800", role: "alert", children: error })) : null, _jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { htmlFor: "visitor-name", className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Visitor name" }), _jsx("input", { id: "visitor-name", value: visitorName, onChange: (e) => setVisitorName(e.target.value), className: fieldClass, autoComplete: "name", placeholder: "Full name" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "visitor-company", className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Company" }), _jsx("input", { id: "visitor-company", value: company, onChange: (e) => setCompany(e.target.value), className: fieldClass, autoComplete: "organization", placeholder: "Optional" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "visitor-host", className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Host name" }), _jsx("input", { id: "visitor-host", value: hostName, onChange: (e) => setHostName(e.target.value), className: fieldClass, placeholder: "Who are you meeting?" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { htmlFor: "visitor-purpose", className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Purpose" }), _jsx("select", { id: "visitor-purpose", value: purpose, onChange: (e) => setPurpose(e.target.value), className: fieldClass, children: PURPOSES.map((p) => (_jsx("option", { value: p, children: p }, p))) })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5", children: [_jsx(Button, { type: "submit", children: "Check in" }), _jsx("span", { className: "text-xs text-slate-500", children: "Demo only \u2014 no API call" })] })] }) }));
};
