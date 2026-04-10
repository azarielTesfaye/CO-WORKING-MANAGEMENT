import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Modal, Button, Badge } from '@cowork/ui-components';
const BUSINESS_HOURS = Array.from({ length: 9 }, (_, i) => i + 9);
export const DeskTimeSlotModal = ({ isOpen, onClose, selectedHour, onSelectHour, isHourBooked, onConfirm, }) => (_jsxs(Modal, { isOpen: isOpen, onClose: onClose, title: "Choose Time Slot", children: [_jsx("div", { className: "grid grid-cols-3 gap-2 mb-4", children: BUSINESS_HOURS.map((hour) => {
                const booked = isHourBooked(hour);
                return (_jsx("button", { type: "button", onClick: () => onSelectHour(hour), className: `p-2 rounded border ${selectedHour === hour ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${booked ? 'opacity-50 cursor-not-allowed' : ''}`, disabled: booked, children: _jsxs("span", { className: "inline-flex flex-col items-center gap-1", children: [_jsxs("span", { children: [hour, ":00"] }), booked ? _jsx(Badge, { color: "red", children: "Taken" }) : null] }) }, hour));
            }) }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: onConfirm, disabled: selectedHour === null, children: "Confirm Booking" }) })] }));
