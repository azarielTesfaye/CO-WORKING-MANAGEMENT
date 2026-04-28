import { useState, useEffect, useMemo } from 'react';
import type { Booking, Desk } from '../types';

interface UseDeskBookingsOptions {
  apiBaseUrl?: string;
  token?: string | null;
}

const FALLBACK_API_URL = 'http://localhost:4000';
const AUTH_TOKEN_KEY = 'cowork.auth.token';

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Request failed';
    throw new Error(message);
  }
  return payload as T;
}

export function useDeskBookings(options?: UseDeskBookingsOptions) {
  const apiBaseUrl = options?.apiBaseUrl ?? FALLBACK_API_URL;
  const authToken = options?.token ?? localStorage.getItem(AUTH_TOKEN_KEY);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState('');
  const [unavailableHours, setUnavailableHours] = useState<number[]>([]);

  useEffect(() => {
    if (!authToken) return;
    const headers = { Authorization: `Bearer ${authToken}` };
    void (async () => {
      try {
        const [desksRes, bookingsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/desks`, { headers }),
          fetch(`${apiBaseUrl}/bookings?date=${encodeURIComponent(selectedDate)}`, { headers }),
        ]);
        const [desksPayload, bookingsPayload] = await Promise.all([
          parseApiResponse<Desk[]>(desksRes),
          parseApiResponse<Booking[]>(bookingsRes),
        ]);
        const availableDeskList = desksPayload.filter((desk) => desk.status === 'available');
        setDesks(availableDeskList);
        setBookings(bookingsPayload);
      } catch (error) {
        console.error('Failed to load desk booking data', error);
      }
    })();
  }, [apiBaseUrl, authToken, selectedDate]);

  useEffect(() => {
    if (!authToken || !selectedDesk || !selectedDate) return;
    void (async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/bookings/availability?date=${encodeURIComponent(selectedDate)}&deskId=${encodeURIComponent(selectedDesk)}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const payload = await parseApiResponse<{ availableHours: number[] }>(response);
        const businessHours = Array.from({ length: 9 }, (_, i) => i + 9);
        const unavailable = businessHours.filter((hour) => !payload.availableHours.includes(hour));
        setUnavailableHours(unavailable);
      } catch (error) {
        console.error('Failed to load desk availability', error);
        setUnavailableHours([]);
      }
    })();
  }, [apiBaseUrl, authToken, selectedDate, selectedDesk]);

  useEffect(() => {
    if (desks.length === 0) {
      setSelectedDesk('');
      return;
    }
    const stillExists = desks.some((desk) => desk.id === selectedDesk);
    if (!selectedDesk || !stillExists) {
      setSelectedDesk(desks[0].id);
    }
  }, [desks, selectedDesk]);

  const availableDesks = useMemo(
    () => desks.map((desk) => ({ id: desk.id, label: desk.label, zone: desk.zone })),
    [desks]
  );

  const deskLabels = useMemo(
    () => desks.reduce<Record<string, string>>((acc, desk) => ({ ...acc, [desk.id]: `Desk ${desk.label}` }), {}),
    [desks]
  );

  const isSlotBooked = (deskId: string, date: string, hour: number) =>
    unavailableHours.includes(hour) ||
    bookings.some((b) => b.deskId === deskId && b.date === date && b.startHour === hour);

  const handleBook = async () => {
    if (selectedHour === null) return;
    if (!authToken) return;
    if (isSlotBooked(selectedDesk, selectedDate, selectedHour)) {
      alert('This slot is already booked');
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          deskId: selectedDesk,
          date: selectedDate,
          startHour: selectedHour,
          durationHours: 1,
        }),
      });
      const booking = await parseApiResponse<Booking>(response);
      setBookings((prev) => [...prev, booking]);
      setIsModalOpen(false);
      setSelectedHour(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  const handleCancel = async (id: string) => {
    if (!authToken) return;
    try {
      const response = await fetch(`${apiBaseUrl}/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok && response.status !== 204) {
        await parseApiResponse<Record<string, never>>(response);
      }
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel booking');
    }
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
    deskLabels,
    myBookingsForToday,
    handleBook,
    handleCancel,
    isSlotBooked,
  };
}
