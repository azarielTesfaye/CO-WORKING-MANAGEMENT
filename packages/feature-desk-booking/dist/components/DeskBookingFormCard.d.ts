import React from 'react';
export interface DeskBookingFormCardProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    selectedDesk: string;
    onDeskChange: (desk: string) => void;
    availableDesks: string[];
    onOpenBookModal: () => void;
}
export declare const DeskBookingFormCard: React.FC<DeskBookingFormCardProps>;
