import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Badge } from '@cowork/ui-components';
import { formatDate, formatTime, saveToLocal, loadFromLocal, isSameDay, isTimeSlotAvailable, TimeSlot } from '@cowork/utils';

interface Booking {
  id: string;
  deskId: string;
  date: string;  // YYYY-MM-DD
  startHour: number; // 0-23
}

export const DeskBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<string>('A1');

  // Load bookings from localStorage on start
  useEffect(() => {
    const saved = loadFromLocal<Booking[]>('deskBookings', []);
    setBookings(saved);
  }, []);

  // Save whenever bookings change
  useEffect(() => {
    saveToLocal('deskBookings', bookings);
  }, [bookings]);

  const availableDesks = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const isSlotBooked = (deskId: string, date: string, hour: number): boolean => {
    return bookings.some(b => b.deskId === deskId && b.date === date && b.startHour === hour);
  };

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
    setBookings([...bookings, newBooking]);
    setIsModalOpen(false);
    setSelectedHour(null);
  };

  const handleCancel = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const myBookingsForToday = bookings.filter(b => b.date === selectedDate);

  return (
    <div className="space-y-6">
      <Card title="📅 Desk Booking">
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Select Desk</label>
          <select value={selectedDesk} onChange={(e) => setSelectedDesk(e.target.value)} className="border rounded p-2">
            {availableDesks.map(desk => (
              <option key={desk} value={desk}>Desk {desk}</option>
            ))}
          </select>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>Book a Time Slot</Button>
      </Card>

      <Card title="My Bookings for this day">
        {myBookingsForToday.length === 0 ? (
          <p className="text-gray-500">No bookings for this date.</p>
        ) : (
          <ul className="space-y-2">
            {myBookingsForToday.map(booking => (
              <li key={booking.id} className="flex justify-between items-center border-b pb-1">
                <span>Desk {booking.deskId} at {booking.startHour}:00</span>
                <Button variant="danger" onClick={() => handleCancel(booking.id)}>Cancel</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Choose Time Slot">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Array.from({ length: 9 }, (_, i) => i + 9).map(hour => {
            const booked = isSlotBooked(selectedDesk, selectedDate, hour);
            return (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                className={`p-2 rounded border ${selectedHour === hour ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${booked ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={booked}
              >
                {hour}:00 {booked && <Badge color="red">Taken</Badge>}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleBook} disabled={selectedHour === null}>Confirm Booking</Button>
        </div>
      </Modal>
    </div>
  );
};