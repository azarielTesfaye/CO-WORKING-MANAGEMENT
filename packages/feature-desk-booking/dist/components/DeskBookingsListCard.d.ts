import React from 'react';
import type { Booking } from '../types';
export interface DeskBookingsListCardProps {
    bookings: Booking[];
    onCancel: (id: string) => void;
}
export declare const DeskBookingsListCard: React.FC<DeskBookingsListCardProps>;
