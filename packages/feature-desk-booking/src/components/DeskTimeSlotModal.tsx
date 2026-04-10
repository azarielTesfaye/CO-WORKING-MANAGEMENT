import React from 'react';
import { Modal, Button, Badge } from '@cowork/ui-components';

const BUSINESS_HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

export interface DeskTimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHour: number | null;
  onSelectHour: (hour: number) => void;
  isHourBooked: (hour: number) => boolean;
  onConfirm: () => void;
}

export const DeskTimeSlotModal: React.FC<DeskTimeSlotModalProps> = ({
  isOpen,
  onClose,
  selectedHour,
  onSelectHour,
  isHourBooked,
  onConfirm,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Choose Time Slot">
    <div className="grid grid-cols-3 gap-2 mb-4">
      {BUSINESS_HOURS.map((hour) => {
        const booked = isHourBooked(hour);
        return (
          <button
            key={hour}
            type="button"
            onClick={() => onSelectHour(hour)}
            className={`p-2 rounded border ${
              selectedHour === hour ? 'bg-blue-600 text-white' : 'bg-gray-100'
            } ${booked ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={booked}
          >
            <span className="inline-flex flex-col items-center gap-1">
              <span>
                {hour}:00
              </span>
              {booked ? <Badge color="red">Taken</Badge> : null}
            </span>
          </button>
        );
      })}
    </div>
    <div className="flex justify-end">
      <Button onClick={onConfirm} disabled={selectedHour === null}>
        Confirm Booking
      </Button>
    </div>
  </Modal>
);
