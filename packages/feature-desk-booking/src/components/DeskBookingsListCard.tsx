import React from 'react';
import { Card, Button } from '@cowork/ui-components';
import type { Booking } from '../types';

export interface DeskBookingsListCardProps {
  bookings: Booking[];
  onCancel: (id: string) => void;
}

export const DeskBookingsListCard: React.FC<DeskBookingsListCardProps> = ({
  bookings,
  onCancel,
}) => (
  <Card title="My Bookings for this day">
    {bookings.length === 0 ? (
      <p className="text-gray-500">No bookings for this date.</p>
    ) : (
      <ul className="space-y-2">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="flex justify-between items-center border-b pb-1 gap-2 flex-wrap"
          >
            <span>
              Desk {booking.deskId} at {booking.startHour}:00
            </span>
            <Button variant="danger" onClick={() => onCancel(booking.id)}>
              Cancel
            </Button>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
