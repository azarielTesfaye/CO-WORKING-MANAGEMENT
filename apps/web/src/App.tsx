import React from 'react';
import { DeskBooking } from '@cowork/feature-desk-booking';
import { VisitorCheckIn } from '@cowork/feature-visitor-checkin';
import { AnnouncementsBoard } from '@cowork/feature-announcements';
import { MeetingRoomBooking } from '@cowork/feature-meeting-rooms';
import { WifiGuestPass } from '@cowork/feature-wifi-guest';
import { SupplyRequestBoard } from '@cowork/feature-supply-request';
import { LostFoundBoard } from '@cowork/feature-lost-found';
import { EmergencyContactsPanel } from '@cowork/feature-emergency-contacts';
import { FacilityInfoPanel } from '@cowork/feature-facility-info';

type AuthMode = 'login' | 'register';
type AppView = 'dashboard' | 'profile' | 'admin' | 'bookings' | 'metrics';
type Role = 'admin' | 'member';
type DeskStatus = 'available' | 'maintenance';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface BookingHistoryItem {
  id: string;
  deskId: string;
  date: string;
  startHour: number;
}

interface AccountSettings {
  notificationsEnabled: boolean;
  timezone: string;
}

interface Desk {
  id: string;
  label: string;
  zone: string;
  capacity: number;
  status: DeskStatus;
  amenities: string[];
}

interface ApiBooking {
  id: string;
  userId: string;
  deskId: string;
  date: string;
  startHour: number;
  durationHours: number;
  createdAt: string;
  notes?: string;
}

interface MetricsOverview {
  totals: {
    desks: number;
    activeDesks: number;
    bookings: number;
    todayBookings: number;
  };
  zoneDistribution: Record<string, number>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const AUTH_TOKEN_KEY = 'cowork.auth.token';
const ACCOUNT_SETTINGS_KEY = 'cowork.account.settings';
const BOOKINGS_KEY = 'deskBookings';

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Request failed';
    throw new Error(message);
  }
  return payload as T;
}

const App: React.FC = () => {
  const [mode, setMode] = React.useState<AuthMode>('login');
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [view, setView] = React.useState<AppView>('dashboard');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [profileName, setProfileName] = React.useState('');
  const [profileEmail, setProfileEmail] = React.useState('');
  const [profileMessage, setProfileMessage] = React.useState<string | null>(null);
  const [desks, setDesks] = React.useState<Desk[]>([]);
  const [desksLoading, setDesksLoading] = React.useState(false);
  const [desksError, setDesksError] = React.useState<string | null>(null);
  const [adminMessage, setAdminMessage] = React.useState<string | null>(null);
  const [editingDeskId, setEditingDeskId] = React.useState<string | null>(null);
  const [deskForm, setDeskForm] = React.useState({
    label: '',
    zone: '',
    capacity: 1,
    status: 'available' as DeskStatus,
    amenities: '',
  });
  const [accountSettings, setAccountSettings] = React.useState<AccountSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(ACCOUNT_SETTINGS_KEY);
      if (!savedSettings) {
        return { notificationsEnabled: true, timezone: 'UTC' };
      }
      const parsed = JSON.parse(savedSettings) as Partial<AccountSettings>;
      return {
        notificationsEnabled: parsed.notificationsEnabled ?? true,
        timezone: parsed.timezone ?? 'UTC',
      };
    } catch {
      return { notificationsEnabled: true, timezone: 'UTC' };
    }
  });
  const [loading, setLoading] = React.useState(false);
  const [checkingSession, setCheckingSession] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bookings, setBookings] = React.useState<ApiBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(false);
  const [bookingsError, setBookingsError] = React.useState<string | null>(null);
  const [bookingsMessage, setBookingsMessage] = React.useState<string | null>(null);
  const [filterDate, setFilterDate] = React.useState('');
  const [filterZone, setFilterZone] = React.useState('');
  const [filterDeskId, setFilterDeskId] = React.useState('');
  const [availabilityDate, setAvailabilityDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [availabilityDeskId, setAvailabilityDeskId] = React.useState('');
  const [availableHours, setAvailableHours] = React.useState<number[]>([]);
  const [editingBooking, setEditingBooking] = React.useState<ApiBooking | null>(null);
  const [bookingForm, setBookingForm] = React.useState({
    deskId: '',
    date: new Date().toISOString().slice(0, 10),
    startHour: 9,
    durationHours: 1,
    notes: '',
  });
  const [metrics, setMetrics] = React.useState<MetricsOverview | null>(null);
  const [metricsLoading, setMetricsLoading] = React.useState(false);
  const [metricsError, setMetricsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setCheckingSession(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = await parseApiResponse<AuthUser>(response);
        setUser(currentUser);
        setProfileName(currentUser.name);
        setProfileEmail(currentUser.email);
      } catch (sessionError) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
        setError(sessionError instanceof Error ? sessionError.message : 'Session expired');
      } finally {
        setCheckingSession(false);
      }
    }

    void loadCurrentUser();
  }, [token]);

  React.useEffect(() => {
    localStorage.setItem(ACCOUNT_SETTINGS_KEY, JSON.stringify(accountSettings));
  }, [accountSettings]);

  React.useEffect(() => {
    if (!user) return;
    setProfileName(user.name);
    setProfileEmail(user.email);
  }, [user]);

  const bookingHistory = React.useMemo<BookingHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKINGS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as BookingHistoryItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && typeof item.id === 'string')
        .sort((a, b) => `${b.date}-${b.startHour}`.localeCompare(`${a.date}-${a.startHour}`));
    } catch {
      return [];
    }
  }, [user, view]);

  const resetDeskForm = () => {
    setDeskForm({
      label: '',
      zone: '',
      capacity: 1,
      status: 'available',
      amenities: '',
    });
    setEditingDeskId(null);
  };

  const toDeskPayload = () => ({
    label: deskForm.label.trim(),
    zone: deskForm.zone.trim(),
    capacity: Number(deskForm.capacity),
    status: deskForm.status,
    amenities: deskForm.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  });

  const fetchDesks = React.useCallback(async () => {
    if (!token) return;
    setDesksLoading(true);
    setDesksError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/desks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await parseApiResponse<Desk[]>(response);
      setDesks(payload);
    } catch (desksFetchError) {
      setDesksError(desksFetchError instanceof Error ? desksFetchError.message : 'Failed to fetch desks');
    } finally {
      setDesksLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (view !== 'admin' || user?.role !== 'admin') return;
    void fetchDesks();
  }, [view, user?.role, fetchDesks]);

  const fetchMetrics = React.useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await parseApiResponse<MetricsOverview>(response);
      setMetrics(payload);
    } catch (metricsFetchError) {
      setMetricsError(metricsFetchError instanceof Error ? metricsFetchError.message : 'Failed to fetch metrics');
    } finally {
      setMetricsLoading(false);
    }
  }, [token, user?.role]);

  React.useEffect(() => {
    if (view !== 'metrics' || user?.role !== 'admin') return;
    void fetchMetrics();
  }, [view, user?.role, fetchMetrics]);

  const fetchBookings = React.useCallback(async () => {
    if (!token) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const params = new URLSearchParams();
      if (filterDate) params.set('date', filterDate);
      if (filterDeskId) params.set('deskId', filterDeskId);
      const query = params.toString();
      const response = await fetch(`${API_BASE_URL}/bookings${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await parseApiResponse<ApiBooking[]>(response);
      setBookings(payload);
    } catch (bookingFetchError) {
      setBookingsError(bookingFetchError instanceof Error ? bookingFetchError.message : 'Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  }, [token, filterDate, filterDeskId]);

  React.useEffect(() => {
    if (view !== 'bookings') return;
    void fetchDesks();
    void fetchBookings();
  }, [view, fetchDesks, fetchBookings]);

  React.useEffect(() => {
    if (!availabilityDeskId && desks.length > 0) {
      setAvailabilityDeskId(desks[0].id);
    }
  }, [desks, availabilityDeskId]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const saveAuth = (authData: AuthResponse) => {
    localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    setToken(authData.token);
    setUser(authData.user);
    setError(null);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : {
              name,
              email,
              password,
            };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const authData = await parseApiResponse<AuthResponse>(response);
      saveAuth(authData);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
    resetForm();
    setMode('login');
    setView('dashboard');
    setProfileMessage(null);
    setAdminMessage(null);
    setDesks([]);
    setDesksError(null);
    setBookings([]);
    setBookingsError(null);
    setBookingsMessage(null);
    setMetrics(null);
    setMetricsError(null);
    resetDeskForm();
  };

  const isAuthenticated = Boolean(user && token);

  const handleProfileSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setUser({
      ...user,
      name: profileName.trim() || user.name,
      email: profileEmail.trim() || user.email,
    });
    setProfileMessage('Profile details updated locally.');
  };

  const handleDeskFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || user?.role !== 'admin') return;
    setAdminMessage(null);
    setDesksError(null);
    try {
      const payload = toDeskPayload();
      const endpoint = editingDeskId ? `${API_BASE_URL}/desks/${editingDeskId}` : `${API_BASE_URL}/desks`;
      const method = editingDeskId ? 'PATCH' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      await parseApiResponse<Desk>(response);
      setAdminMessage(editingDeskId ? 'Desk updated successfully.' : 'Desk created successfully.');
      resetDeskForm();
      await fetchDesks();
    } catch (deskSubmitError) {
      setDesksError(deskSubmitError instanceof Error ? deskSubmitError.message : 'Failed to save desk');
    }
  };

  const startEditDesk = (desk: Desk) => {
    setEditingDeskId(desk.id);
    setDeskForm({
      label: desk.label,
      zone: desk.zone,
      capacity: desk.capacity,
      status: desk.status,
      amenities: desk.amenities.join(', '),
    });
    setAdminMessage(null);
  };

  const toggleDeskMaintenance = async (desk: Desk) => {
    if (!token || user?.role !== 'admin') return;
    setAdminMessage(null);
    setDesksError(null);
    const nextStatus: DeskStatus = desk.status === 'available' ? 'maintenance' : 'available';
    try {
      const response = await fetch(`${API_BASE_URL}/desks/${desk.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      await parseApiResponse<Desk>(response);
      setAdminMessage(`Desk ${desk.label} set to ${nextStatus}.`);
      await fetchDesks();
    } catch (deskStatusError) {
      setDesksError(deskStatusError instanceof Error ? deskStatusError.message : 'Failed to update desk status');
    }
  };

  const loadAvailability = async () => {
    if (!token || !availabilityDate || !availabilityDeskId) return;
    setBookingsMessage(null);
    setBookingsError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/availability?date=${encodeURIComponent(availabilityDate)}&deskId=${encodeURIComponent(availabilityDeskId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const payload = await parseApiResponse<{ availableHours: number[] }>(response);
      setAvailableHours(payload.availableHours);
    } catch (availabilityError) {
      setBookingsError(availabilityError instanceof Error ? availabilityError.message : 'Failed to load availability');
      setAvailableHours([]);
    }
  };

  const startEditBooking = (booking: ApiBooking) => {
    setEditingBooking(booking);
    setBookingForm({
      deskId: booking.deskId,
      date: booking.date,
      startHour: booking.startHour,
      durationHours: booking.durationHours,
      notes: booking.notes ?? '',
    });
    setBookingsMessage(null);
  };

  const cancelBooking = async (bookingId: string) => {
    if (!token) return;
    setBookingsError(null);
    setBookingsMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok && response.status !== 204) {
        await parseApiResponse<Record<string, never>>(response);
      }
      setBookingsMessage('Booking canceled.');
      if (editingBooking?.id === bookingId) setEditingBooking(null);
      await fetchBookings();
    } catch (cancelError) {
      setBookingsError(cancelError instanceof Error ? cancelError.message : 'Failed to cancel booking');
    }
  };

  const saveBookingEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !editingBooking) return;
    setBookingsError(null);
    setBookingsMessage(null);
    try {
      const deleteResponse = await fetch(`${API_BASE_URL}/bookings/${editingBooking.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!deleteResponse.ok && deleteResponse.status !== 204) {
        await parseApiResponse<Record<string, never>>(deleteResponse);
      }

      const createResponse = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deskId: bookingForm.deskId,
          date: bookingForm.date,
          startHour: Number(bookingForm.startHour),
          durationHours: Number(bookingForm.durationHours),
          notes: bookingForm.notes.trim() || undefined,
        }),
      });
      await parseApiResponse<ApiBooking>(createResponse);
      setBookingsMessage('Booking updated.');
      setEditingBooking(null);
      await fetchBookings();
    } catch (editError) {
      setBookingsError(editError instanceof Error ? editError.message : 'Failed to update booking');
    }
  };

  const zones = React.useMemo(() => Array.from(new Set(desks.map((desk) => desk.zone))), [desks]);
  const visibleBookings = React.useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!filterZone) return true;
        const desk = desks.find((item) => item.id === booking.deskId);
        return desk?.zone === filterZone;
      })
      .sort((a, b) => `${b.date}-${b.startHour}`.localeCompare(`${a.date}-${a.startHour}`));
  }, [bookings, desks, filterZone]);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgb(99,102,241,0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgb(14,165,233,0.12),transparent_45%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <header className="mb-10 text-center sm:mb-12 sm:text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Workspace</p>
          <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Co-working Management
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mx-0">
            Sign in to manage your account, desk and room bookings, and workspace tools.
          </p>
        </header>

        <main className="space-y-8">
          {checkingSession ? (
            <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 text-sm text-slate-600 shadow-sm backdrop-blur">
              Checking your session...
            </section>
          ) : isAuthenticated ? (
            <>
              <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="text-xs uppercase tracking-wide text-indigo-600">{user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setView('dashboard')}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                        view === 'dashboard'
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('bookings')}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                        view === 'bookings'
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Bookings
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('profile')}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                        view === 'profile'
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Profile
                    </button>
                    {user.role === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => setView('admin')}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                          view === 'admin'
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Admin
                      </button>
                    ) : null}
                    {user.role === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => setView('metrics')}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                          view === 'metrics'
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Metrics
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </section>
              {view === 'dashboard' ? (
                <>
                  <DeskBooking apiBaseUrl={API_BASE_URL} token={token} />
                  <FacilityInfoPanel />
                  <MeetingRoomBooking />
                  <VisitorCheckIn />
                  <WifiGuestPass />
                  <SupplyRequestBoard />
                  <LostFoundBoard />
                  <EmergencyContactsPanel />
                  <AnnouncementsBoard />
                </>
              ) : view === 'bookings' ? (
                <>
                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h2 className="text-lg font-semibold text-slate-900">Bookings Management</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Search availability, filter bookings, and edit or cancel existing records.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Date</span>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(event) => setFilterDate(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Zone</span>
                        <select
                          value={filterZone}
                          onChange={(event) => setFilterZone(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="">All zones</option>
                          {zones.map((zone) => (
                            <option key={zone} value={zone}>
                              {zone}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Desk</span>
                        <select
                          value={filterDeskId}
                          onChange={(event) => setFilterDeskId(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="">All desks</option>
                          {desks.map((desk) => (
                            <option key={desk.id} value={desk.id}>
                              {desk.label} ({desk.zone})
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          void fetchBookings();
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Apply filters
                      </button>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h3 className="text-lg font-semibold text-slate-900">Availability Search</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <input
                        type="date"
                        value={availabilityDate}
                        onChange={(event) => setAvailabilityDate(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                      <select
                        value={availabilityDeskId}
                        onChange={(event) => setAvailabilityDeskId(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="">Select desk</option>
                        {desks.map((desk) => (
                          <option key={desk.id} value={desk.id}>
                            {desk.label} ({desk.zone})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          void loadAvailability();
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Search availability
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      Available hours: {availableHours.length ? availableHours.join(', ') : 'No results yet'}
                    </p>
                  </section>

                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h3 className="text-lg font-semibold text-slate-900">Booking History</h3>
                    {bookingsMessage ? <p className="mt-2 text-sm text-emerald-700">{bookingsMessage}</p> : null}
                    {bookingsError ? <p className="mt-2 text-sm text-rose-600">{bookingsError}</p> : null}
                    {bookingsLoading ? <p className="mt-2 text-sm text-slate-500">Loading bookings...</p> : null}
                    {!bookingsLoading && visibleBookings.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">No bookings found for current filters.</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {visibleBookings.map((booking) => {
                          const desk = desks.find((item) => item.id === booking.deskId);
                          return (
                            <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {desk?.label ?? booking.deskId} {desk ? `(${desk.zone})` : ''}
                              </p>
                              <p className="text-sm text-slate-700">
                                {booking.date} at {booking.startHour}:00 for {booking.durationHours}h
                              </p>
                              {booking.notes ? <p className="text-xs text-slate-500">Notes: {booking.notes}</p> : null}
                              <div className="mt-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditBooking(booking)}
                                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void cancelBooking(booking.id);
                                  }}
                                  className="inline-flex items-center justify-center rounded-xl border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {editingBooking ? (
                    <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                      <h3 className="text-lg font-semibold text-slate-900">Edit Booking</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Updates are applied by replacing the original booking.
                      </p>
                      <form onSubmit={saveBookingEdit} className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Desk</span>
                          <select
                            value={bookingForm.deskId}
                            onChange={(event) => setBookingForm((prev) => ({ ...prev, deskId: event.target.value }))}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          >
                            {desks.map((desk) => (
                              <option key={desk.id} value={desk.id}>
                                {desk.label} ({desk.zone})
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Date</span>
                          <input
                            type="date"
                            value={bookingForm.date}
                            onChange={(event) => setBookingForm((prev) => ({ ...prev, date: event.target.value }))}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Start Hour</span>
                          <input
                            type="number"
                            min={0}
                            max={23}
                            value={bookingForm.startHour}
                            onChange={(event) =>
                              setBookingForm((prev) => ({ ...prev, startHour: Number(event.target.value) }))
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Duration (hours)</span>
                          <input
                            type="number"
                            min={1}
                            max={8}
                            value={bookingForm.durationHours}
                            onChange={(event) =>
                              setBookingForm((prev) => ({ ...prev, durationHours: Number(event.target.value) }))
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Notes</span>
                          <input
                            value={bookingForm.notes}
                            onChange={(event) => setBookingForm((prev) => ({ ...prev, notes: event.target.value }))}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <div className="flex gap-2 sm:col-span-2">
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Save booking
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBooking(null)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancel edit
                          </button>
                        </div>
                      </form>
                    </section>
                  ) : null}
                </>
              ) : view === 'profile' ? (
                <>
                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h2 className="text-lg font-semibold text-slate-900">User Info</h2>
                    <p className="mt-1 text-sm text-slate-600">Manage your basic account information.</p>
                    <form onSubmit={handleProfileSave} className="mt-4 space-y-4">
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
                        <input
                          value={profileName}
                          onChange={(event) => setProfileName(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(event) => setProfileEmail(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                        />
                      </label>
                      {profileMessage ? <p className="text-sm text-emerald-700">{profileMessage}</p> : null}
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Save profile
                      </button>
                    </form>
                  </section>

                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h2 className="text-lg font-semibold text-slate-900">Role</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      You are signed in as <span className="font-semibold text-indigo-700">{user.role}</span>.
                    </p>
                  </section>

                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h2 className="text-lg font-semibold text-slate-900">Booking History</h2>
                    <p className="mt-1 text-sm text-slate-600">Recent desk bookings saved in your browser.</p>
                    <div className="mt-4 space-y-3">
                      {bookingHistory.length === 0 ? (
                        <p className="text-sm text-slate-500">No booking history yet.</p>
                      ) : (
                        bookingHistory.map((booking) => (
                          <div
                            key={booking.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                          >
                            <p className="font-medium text-slate-900">Desk {booking.deskId}</p>
                            <p>
                              {booking.date} at {booking.startHour}:00
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>
                    <p className="mt-1 text-sm text-slate-600">Preferences are saved locally in this browser.</p>
                    <div className="mt-4 space-y-4">
                      <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2">
                        <span className="text-sm font-medium text-slate-700">Email notifications</span>
                        <input
                          type="checkbox"
                          checked={accountSettings.notificationsEnabled}
                          onChange={(event) =>
                            setAccountSettings((prev) => ({
                              ...prev,
                              notificationsEnabled: event.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Timezone</span>
                        <select
                          value={accountSettings.timezone}
                          onChange={(event) =>
                            setAccountSettings((prev) => ({
                              ...prev,
                              timezone: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                        >
                          <option value="UTC">UTC</option>
                          <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                          <option value="Europe/London">Europe/London</option>
                          <option value="America/New_York">America/New_York</option>
                        </select>
                      </label>
                    </div>
                  </section>
                </>
              ) : view === 'metrics' && user.role === 'admin' ? (
                <>
                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">Workspace Metrics</h2>
                      <button
                        type="button"
                        onClick={() => {
                          void fetchMetrics();
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Refresh
                      </button>
                    </div>
                    {metricsLoading ? <p className="text-sm text-slate-600">Loading metrics...</p> : null}
                    {metricsError ? <p className="text-sm text-rose-600">{metricsError}</p> : null}
                    {metrics ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Total Desks</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.totals.desks}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Active Desks</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.totals.activeDesks}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Total Bookings</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.totals.bookings}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Today Bookings</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.totals.todayBookings}</p>
                          </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                          <h3 className="text-sm font-semibold text-slate-900">Zone Distribution</h3>
                          {Object.keys(metrics.zoneDistribution).length === 0 ? (
                            <p className="mt-2 text-sm text-slate-500">No zone data available.</p>
                          ) : (
                            <ul className="mt-3 space-y-2">
                              {Object.entries(metrics.zoneDistribution).map(([zone, count]) => (
                                <li
                                  key={zone}
                                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                                >
                                  <span className="font-medium text-slate-700">{zone}</span>
                                  <span className="font-semibold text-slate-900">{count}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    ) : null}
                  </section>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h2 className="text-lg font-semibold text-slate-900">Desk Management</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Create, edit, and maintain desks. Manage zones, capacity, status, and amenities.
                    </p>

                    <form onSubmit={handleDeskFormSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Desk Label</span>
                        <input
                          required
                          value={deskForm.label}
                          onChange={(event) => setDeskForm((prev) => ({ ...prev, label: event.target.value }))}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                          placeholder="A3"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Zone</span>
                        <input
                          required
                          value={deskForm.zone}
                          onChange={(event) => setDeskForm((prev) => ({ ...prev, zone: event.target.value }))}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                          placeholder="North"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Capacity</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          required
                          value={deskForm.capacity}
                          onChange={(event) =>
                            setDeskForm((prev) => ({ ...prev, capacity: Number(event.target.value) || 1 }))
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
                        <select
                          value={deskForm.status}
                          onChange={(event) =>
                            setDeskForm((prev) => ({ ...prev, status: event.target.value as DeskStatus }))
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                        >
                          <option value="available">available</option>
                          <option value="maintenance">maintenance</option>
                        </select>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Amenities (comma separated)</span>
                        <input
                          value={deskForm.amenities}
                          onChange={(event) => setDeskForm((prev) => ({ ...prev, amenities: event.target.value }))}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                          placeholder="Monitor, Dock, Whiteboard"
                        />
                      </label>
                      <div className="flex gap-2 sm:col-span-2">
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          {editingDeskId ? 'Update desk' : 'Create desk'}
                        </button>
                        {editingDeskId ? (
                          <button
                            type="button"
                            onClick={resetDeskForm}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancel edit
                          </button>
                        ) : null}
                      </div>
                    </form>
                    {adminMessage ? <p className="mt-3 text-sm text-emerald-700">{adminMessage}</p> : null}
                    {desksError ? <p className="mt-3 text-sm text-rose-600">{desksError}</p> : null}
                  </section>

                  <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">Existing Desks</h2>
                      <button
                        type="button"
                        onClick={() => {
                          void fetchDesks();
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Refresh
                      </button>
                    </div>
                    {desksLoading ? <p className="text-sm text-slate-600">Loading desks...</p> : null}
                    {!desksLoading && desks.length === 0 ? (
                      <p className="text-sm text-slate-500">No desks found.</p>
                    ) : (
                      <div className="space-y-3">
                        {desks.map((desk) => (
                          <div
                            key={desk.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {desk.label} · {desk.zone}
                                </p>
                                <p>
                                  Capacity: {desk.capacity} · Status:{' '}
                                  <span className="font-medium capitalize">{desk.status}</span>
                                </p>
                                <p className="text-xs text-slate-500">
                                  Amenities: {desk.amenities.length > 0 ? desk.amenities.join(', ') : 'None'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditDesk(desk)}
                                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void toggleDeskMaintenance(desk);
                                  }}
                                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                  {desk.status === 'available' ? 'Set maintenance' : 'Set available'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              ) : null}
            </>
          ) : (
            <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === 'register'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' ? (
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      minLength={2}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                      placeholder="Jane Doe"
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                    placeholder="member@cowork.local"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/30 transition focus:ring-4"
                    placeholder="••••••••"
                  />
                </label>

                {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
                </button>
              </form>
            </section>
          )}
        </main>

        <footer className="mt-14 text-center text-xs text-slate-400 sm:text-left">
          Auth now connected to API · booking module still local-first
        </footer>
      </div>
    </div>
  );
};

export default App;
