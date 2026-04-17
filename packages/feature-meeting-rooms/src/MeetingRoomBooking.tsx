import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Badge } from '@cowork/ui-components';
import { formatDate, loadFromLocal, saveToLocal } from '@cowork/utils';

const STORAGE_KEY = 'meetingRoomBookings';

type RoomId = 'Focus' | 'Collab' | 'Town hall';

interface Booking {
  id: string;
  room: RoomId;
  dateKey: string;
  startHour: number;
  endHour: number;
}

const ROOMS: RoomId[] = ['Focus', 'Collab', 'Town hall'];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function overlaps(a: Booking, b: Booking): boolean {
  if (a.room !== b.room || a.dateKey !== b.dateKey) return false;
  return a.startHour < b.endHour && a.endHour > b.startHour;
}

/** Reserve small meeting rooms; bookings persist in localStorage. */
export const MeetingRoomBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [room, setRoom] = useState<RoomId>('Focus');
  const [day, setDay] = useState(() => dateKey(new Date()));
  const [startHour, setStartHour] = useState(10);
  const [duration, setDuration] = useState<1 | 2>(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setBookings(loadFromLocal<Booking[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    saveToLocal(STORAGE_KEY, bookings);
  }, [bookings]);

  const endHour = startHour + duration;

  const conflict = useMemo(() => {
    const candidate: Booking = {
      id: '',
      room,
      dateKey: day,
      startHour,
      endHour,
    };
    return bookings.some((b) => overlaps(candidate, b));
  }, [bookings, room, day, startHour, endHour]);

  const todayBookings = useMemo(() => {
    const key = dateKey(new Date());
    return bookings
      .filter((b) => b.dateKey === key)
      .sort((a, b) => a.startHour - b.startHour || a.room.localeCompare(b.room));
  }, [bookings]);

  const handleBook = () => {
    if (conflict) {
      setMessage('That slot overlaps an existing booking for this room.');
      return;
    }
    if (endHour > 18) {
      setMessage('Bookings must end by 6:00 PM in this demo.');
      return;
    }
    const id = crypto.randomUUID?.() ?? `mr-${Date.now()}`;
    setBookings((prev) => [...prev, { id, room, dateKey: day, startHour, endHour }]);
    setMessage(null);
  };

  const cancel = (id: string) => setBookings((prev) => prev.filter((b) => b.id !== id));

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15';

  return (
    <div className="space-y-8">
      <Card
        title="Meeting rooms"
        description="Hold a room for a short block. Saved locally in this browser only."
      >
        <div className="space-y-5">
          {message ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
              {message}
            </p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="mr-room" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Room
              </label>
              <select
                id="mr-room"
                value={room}
                onChange={(e) => setRoom(e.target.value as RoomId)}
                className={fieldClass}
              >
                {ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mr-day" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </label>
              <input
                id="mr-day"
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="mr-start" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Start (hour)
              </label>
              <select
                id="mr-start"
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className={fieldClass}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}:00
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mr-duration" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Duration
              </label>
              <select
                id="mr-duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as 1 | 2)}
                className={fieldClass}
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <Button type="button" onClick={handleBook} disabled={conflict}>
              Reserve slot
            </Button>
            <span className="text-xs text-slate-500">
              {startHour}:00 – {endHour}:00 · {formatDate(new Date(day + 'T12:00:00'))}
            </span>
          </div>
        </div>
      </Card>

      <Card title="Today on the calendar" description="Bookings whose date is today.">
        {todayBookings.length === 0 ? (
          <p className="text-sm text-slate-600">No meeting room bookings for today yet.</p>
        ) : (
          <ul className="space-y-3">
            {todayBookings.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="blue">{b.room}</Badge>
                  <span className="text-sm font-medium text-slate-900">
                    {b.startHour}:00 – {b.endHour}:00
                  </span>
                </div>
                <Button type="button" variant="ghost" className="!py-1.5 !text-xs" onClick={() => cancel(b.id)}>
                  Cancel
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
