import React from 'react';
export interface DeskTimeSlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedHour: number | null;
    onSelectHour: (hour: number) => void;
    isHourBooked: (hour: number) => boolean;
    onConfirm: () => void;
}
export declare const DeskTimeSlotModal: React.FC<DeskTimeSlotModalProps>;
