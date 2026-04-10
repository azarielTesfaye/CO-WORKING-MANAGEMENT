import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal, Button, Badge } from '@cowork/ui-components';
const BUSINESS_HOURS = Array.from({ length: 9 }, (_, i) => i + 9);
export const DeskTimeSlotModal = ({ isOpen, onClose, selectedHour, onSelectHour, isHourBooked, onConfirm, }) => (_jsxs(Modal, { isOpen: isOpen, onClose: onClose, title: "Choose a time slot", children: [_jsx("p", { className: "mb-4 text-sm text-slate-600", children: "Tap an hour to select it. Slots marked taken are unavailable for this desk and date." }), _jsx("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3", children: BUSINESS_HOURS.map((hour) => {
                const booked = isHourBooked(hour);
                const selected = selectedHour === hour;
                return (_jsxs("button", { type: "button", onClick: () => onSelectHour(hour), className: [
                        'flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-semibold tabular-nums transition-all duration-200',
                        booked
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
                            : selected
                                ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/80 hover:shadow-md active:scale-[0.98]',
                    ].join(' '), disabled: booked, children: [_jsxs("span", { children: [hour, ":00"] }), booked ? _jsx(Badge, { color: "red", children: "Taken" }) : null] }, hour));
            }) }), _jsxs("div", { className: "mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end", children: [_jsx(Button, { variant: "secondary", className: "w-full sm:w-auto", onClick: onClose, children: "Cancel" }), _jsx(Button, { className: "w-full sm:w-auto", onClick: onConfirm, disabled: selectedHour === null, children: "Confirm booking" })] })] }));
