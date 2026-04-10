import { jsx as _jsx } from "react/jsx-runtime";
export const Button = ({ variant = 'primary', children, className = '', ...props }) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]';
    const variants = {
        primary: 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-indigo-700 focus-visible:ring-indigo-500',
        secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
        danger: 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-rose-700 focus-visible:ring-rose-500',
        ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
    };
    return (_jsx("button", { type: "button", className: `${base} ${variants[variant]} ${className}`.trim(), ...props, children: children }));
};
