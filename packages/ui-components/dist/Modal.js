import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './Button';
export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: title }), children, _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Button, { variant: "secondary", onClick: onClose, children: "Close" }) })] }) }));
};
