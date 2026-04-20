import React from 'react';
import { DeskBooking } from '@cowork/feature-desk-booking';
import { VisitorCheckIn } from '@cowork/feature-visitor-checkin';
import { AnnouncementsBoard } from '@cowork/feature-announcements';

type AuthMode = 'login' | 'register';
type AppView = 'dashboard' | 'profile';
type Role = 'admin' | 'member';

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
            Login or register to access your account and manage desk bookings.
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
                      onClick={() => setView('profile')}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                        view === 'profile'
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Profile
                    </button>
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
                  <DeskBooking />
                  <VisitorCheckIn />
                  <AnnouncementsBoard />
                </>
              ) : (
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
              )}
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
