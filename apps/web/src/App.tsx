import React from 'react';
import { DeskBooking } from '@cowork/feature-desk-booking';

const App: React.FC = () => (
  <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Co-working Management</h1>
        <p className="text-sm text-slate-600 mt-1">
          Monorepo demo: app shell + shared UI + feature package composed from smaller components.
        </p>
      </div>
    </header>
    <main className="mx-auto max-w-3xl px-4 py-8">
      <DeskBooking />
    </main>
  </div>
);

export default App;
