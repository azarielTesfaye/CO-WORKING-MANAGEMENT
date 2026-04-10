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
  <Card
    title="Today on this date"
    description="Reservations that match the date you selected above."
  >
    {bookings.length === 0 ? (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-600">No bookings yet</p>
        <p className="mt-1 text-xs text-slate-500">Choose a slot to add your first reservation.</p>
      </div>
    ) : (
      <ul className="space-y-3">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 shadow-sm"
          >
            <div className="flex min-w-0 flex-1 items-baseline gap-2">
              <span className="truncate text-sm font-semibold text-slate-900">Desk {booking.deskId}</span>
              <span className="text-slate-300">·</span>
              <span className="text-sm tabular-nums text-slate-600">
                {booking.startHour}:00
                <span className="ml-1 text-xs font-medium text-slate-400">start</span>
              </span>
            </div>
            <Button variant="danger" className="shrink-0 !py-2 !text-xs" onClick={() => onCancel(booking.id)}>
              Cancel
            </Button>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
