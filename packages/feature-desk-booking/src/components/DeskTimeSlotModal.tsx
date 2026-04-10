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
  <Modal isOpen={isOpen} onClose={onClose} title="Choose a time slot">
    <p className="mb-4 text-sm text-slate-600">
      Tap an hour to select it. Slots marked taken are unavailable for this desk and date.
    </p>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3">
      {BUSINESS_HOURS.map((hour) => {
        const booked = isHourBooked(hour);
        const selected = selectedHour === hour;
        return (
          <button
            key={hour}
            type="button"
            onClick={() => onSelectHour(hour)}
            className={[
              'flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-semibold tabular-nums transition-all duration-200',
              booked
                ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
                : selected
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/80 hover:shadow-md active:scale-[0.98]',
            ].join(' ')}
            disabled={booked}
          >
            <span>{hour}:00</span>
            {booked ? <Badge color="red">Taken</Badge> : null}
          </button>
        );
      })}
    </div>
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
      <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
        Cancel
      </Button>
      <Button className="w-full sm:w-auto" onClick={onConfirm} disabled={selectedHour === null}>
        Confirm booking
      </Button>
    </div>
  </Modal>
);
