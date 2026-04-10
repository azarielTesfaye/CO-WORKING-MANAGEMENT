import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDeskBookings } from './hooks/useDeskBookings';
import { DeskBookingFormCard } from './components/DeskBookingFormCard';
import { DeskBookingsListCard } from './components/DeskBookingsListCard';
import { DeskTimeSlotModal } from './components/DeskTimeSlotModal';
/** Composes small feature-local components; shared primitives come from `@cowork/ui-components`. */
export const DeskBooking = () => {
    const model = useDeskBookings();
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(DeskBookingFormCard, { selectedDate: model.selectedDate, onDateChange: model.setSelectedDate, selectedDesk: model.selectedDesk, onDeskChange: model.setSelectedDesk, availableDesks: model.availableDesks, onOpenBookModal: model.openModal }), _jsx(DeskBookingsListCard, { bookings: model.myBookingsForToday, onCancel: model.handleCancel }), _jsx(DeskTimeSlotModal, { isOpen: model.isModalOpen, onClose: model.closeModal, selectedHour: model.selectedHour, onSelectHour: model.setSelectedHour, isHourBooked: (hour) => model.isSlotBooked(model.selectedDesk, model.selectedDate, hour), onConfirm: model.handleBook })] }));
};
