import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Card = ({ title, children }) => {
    return (_jsxs("div", { className: "border rounded-lg shadow-md p-4 bg-white", children: [title && _jsx("h3", { className: "text-lg font-bold mb-2", children: title }), children] }));
};
