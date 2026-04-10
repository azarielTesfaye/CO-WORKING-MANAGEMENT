import React from 'react';
import { DeskBooking } from '@cowork/feature-desk-booking';

const App: React.FC = () => (
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
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Workspace
        </p>
        <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          Co-working Management
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mx-0">
          Book desks in a few clicks. Built as a monorepo: shared UI primitives, a feature package of
          small components, and this app shell.
        </p>
      </header>

      <main className="space-y-8">
        <DeskBooking />
      </main>

      <footer className="mt-14 text-center text-xs text-slate-400 sm:text-left">
        Local-first demo · bookings stored in your browser
      </footer>
    </div>
  </div>
);

export default App;
