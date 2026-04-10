import React from 'react';
import { useDeskBookings } from './hooks/useDeskBookings';
import { DeskBookingFormCard } from './components/DeskBookingFormCard';
import { DeskBookingsListCard } from './components/DeskBookingsListCard';
import { DeskTimeSlotModal } from './components/DeskTimeSlotModal';

/** Composes small feature-local components; shared primitives come from `@cowork/ui-components`. */
export const DeskBooking: React.FC = () => {
  const model = useDeskBookings();

  return (
    <div className="space-y-8">
      <DeskBookingFormCard
        selectedDate={model.selectedDate}
        onDateChange={model.setSelectedDate}
        selectedDesk={model.selectedDesk}
        onDeskChange={model.setSelectedDesk}
        availableDesks={model.availableDesks}
        onOpenBookModal={model.openModal}
      />

      <DeskBookingsListCard
        bookings={model.myBookingsForToday}
        onCancel={model.handleCancel}
      />

      <DeskTimeSlotModal
        isOpen={model.isModalOpen}
        onClose={model.closeModal}
        selectedHour={model.selectedHour}
        onSelectHour={model.setSelectedHour}
        isHourBooked={(hour) =>
          model.isSlotBooked(model.selectedDesk, model.selectedDate, hour)
        }
        onConfirm={model.handleBook}
      />
    </div>
  );
};
