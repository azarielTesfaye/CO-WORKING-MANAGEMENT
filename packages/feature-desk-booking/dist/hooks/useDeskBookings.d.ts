import type { Booking } from '../types';
export declare function useDeskBookings(): {
    selectedDate: string;
    setSelectedDate: import("react").Dispatch<import("react").SetStateAction<string>>;
    selectedDesk: string;
    setSelectedDesk: import("react").Dispatch<import("react").SetStateAction<string>>;
    selectedHour: number | null;
    setSelectedHour: import("react").Dispatch<import("react").SetStateAction<number | null>>;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    availableDesks: string[];
    myBookingsForToday: Booking[];
    handleBook: () => void;
    handleCancel: (id: string) => void;
    isSlotBooked: (deskId: string, date: string, hour: number) => boolean;
};
