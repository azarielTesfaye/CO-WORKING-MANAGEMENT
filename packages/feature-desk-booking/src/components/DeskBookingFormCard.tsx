import React from 'react';
import { Card, Button } from '@cowork/ui-components';

const fieldClass =
  'mt-1.5 w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15';

export interface DeskBookingFormCardProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedDesk: string;
  onDeskChange: (desk: string) => void;
  availableDesks: string[];
  onOpenBookModal: () => void;
}

export const DeskBookingFormCard: React.FC<DeskBookingFormCardProps> = ({
  selectedDate,
  onDateChange,
  selectedDesk,
  onDeskChange,
  availableDesks,
  onOpenBookModal,
}) => (
  <Card
    title="Desk booking"
    description="Pick a date and desk, then choose an available time."
  >
    <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
      <div>
        <label htmlFor="booking-date" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Date
        </label>
        <input
          id="booking-date"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="booking-desk" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Desk
        </label>
        <select
          id="booking-desk"
          value={selectedDesk}
          onChange={(e) => onDeskChange(e.target.value)}
          className={fieldClass}
        >
          {availableDesks.map((desk) => (
            <option key={desk} value={desk}>
              Desk {desk}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
      <Button onClick={onOpenBookModal}>Book a time slot</Button>
      <span className="text-xs text-slate-500">Opens the slot picker for your selection</span>
    </div>
  </Card>
);
