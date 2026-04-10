import React from 'react';
import { Card, Button } from '@cowork/ui-components';

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
  <Card title="📅 Desk Booking">
    <div className="mb-4">
      <label className="block font-medium mb-1">Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="border rounded p-2 w-full max-w-xs"
      />
    </div>

    <div className="mb-4">
      <label className="block font-medium mb-1">Select Desk</label>
      <select
        value={selectedDesk}
        onChange={(e) => onDeskChange(e.target.value)}
        className="border rounded p-2 w-full max-w-xs"
      >
        {availableDesks.map((desk) => (
          <option key={desk} value={desk}>
            Desk {desk}
          </option>
        ))}
      </select>
    </div>

    <Button onClick={onOpenBookModal}>Book a Time Slot</Button>
  </Card>
);
