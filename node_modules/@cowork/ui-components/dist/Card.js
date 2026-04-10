import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Card = ({ title, description, children }) => {
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm", children: [(title || description) && (_jsxs("div", { className: "mb-5 border-b border-slate-100 pb-4", children: [title && (_jsx("h3", { className: "text-lg font-semibold tracking-tight text-slate-900", children: title })), description && (_jsx("p", { className: "mt-1 text-sm font-medium text-slate-500", children: description }))] })), children] }));
};
