import { useState, useEffect, useMemo } from 'react';
import { saveToLocal, loadFromLocal } from '@cowork/utils';
import type { Booking } from '../types';

export function useDeskBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState('A1');

  useEffect(() => {
    setBookings(loadFromLocal<Booking[]>('deskBookings', []));
  }, []);

  useEffect(() => {
    saveToLocal('deskBookings', bookings);
  }, [bookings]);

  const availableDesks = useMemo(() => ['A1', 'A2', 'B1', 'B2', 'C1'], []);

  const isSlotBooked = (deskId: string, date: string, hour: number) =>
    bookings.some((b) => b.deskId === deskId && b.date === date && b.startHour === hour);

  const handleBook = () => {
    if (selectedHour === null) return;
    if (isSlotBooked(selectedDesk, selectedDate, selectedHour)) {
      alert('This slot is already booked');
      return;
    }
    const newBooking: Booking = {
      id: Date.now().toString(),
      deskId: selectedDesk,
      date: selectedDate,
      startHour: selectedHour,
    };
    setBookings((prev) => [...prev, newBooking]);
    setIsModalOpen(false);
    setSelectedHour(null);
  };

  const handleCancel = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const myBookingsForToday = useMemo(
    () => bookings.filter((b) => b.date === selectedDate),
    [bookings, selectedDate]
  );

  return {
    selectedDate,
    setSelectedDate,
    selectedDesk,
    setSelectedDesk,
    selectedHour,
    setSelectedHour,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => {
      setIsModalOpen(false);
      setSelectedHour(null);
    },
    availableDesks,
    myBookingsForToday,
    handleBook,
    handleCancel,
    isSlotBooked,
  };
}
