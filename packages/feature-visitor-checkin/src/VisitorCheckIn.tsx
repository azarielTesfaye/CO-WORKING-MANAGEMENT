import React, { useState } from 'react';
import { Card, Button, Badge } from '@cowork/ui-components';

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 transition-[border-color,box-shadow] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15';

const PURPOSES = ['Meeting', 'Delivery', 'Interview', 'Other'] as const;

/** Single UI feature: visitor self check-in at reception (client-side only). */
export const VisitorCheckIn: React.FC = () => {
  const [visitorName, setVisitorName] = useState('');
  const [company, setCompany] = useState('');
  const [hostName, setHostName] = useState('');
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>('Meeting');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setVisitorName('');
    setCompany('');
    setHostName('');
    setPurpose('Meeting');
    setError(null);
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = visitorName.trim();
    const host = hostName.trim();
    if (!name || !host) {
      setError('Visitor name and host name are required.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card
        title="You are checked in"
        description="Show this screen at reception if asked. This demo does not send data to a server."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="green">Arrival</Badge>
            <span className="text-sm font-semibold text-slate-900">{visitorName.trim()}</span>
            {company.trim() ? (
              <span className="text-sm text-slate-600">· {company.trim()}</span>
            ) : null}
          </div>
          <dl className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visiting</dt>
              <dd className="font-medium text-slate-900">{hostName.trim()}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Purpose</dt>
              <dd className="font-medium text-slate-900">{purpose}</dd>
            </div>
          </dl>
          <Button type="button" variant="secondary" onClick={reset}>
            Register another visitor
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Visitor check-in"
      description="For guests arriving on site. Filled data stays in this browser until you submit."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="visitor-name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Visitor name
            </label>
            <input
              id="visitor-name"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className={fieldClass}
              autoComplete="name"
              placeholder="Full name"
            />
          </div>
          <div>
            <label htmlFor="visitor-company" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Company
            </label>
            <input
              id="visitor-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={fieldClass}
              autoComplete="organization"
              placeholder="Optional"
            />
          </div>
          <div>
            <label htmlFor="visitor-host" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Host name
            </label>
            <input
              id="visitor-host"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className={fieldClass}
              placeholder="Who are you meeting?"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="visitor-purpose" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Purpose
            </label>
            <select
              id="visitor-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as (typeof PURPOSES)[number])}
              className={fieldClass}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <Button type="submit">Check in</Button>
          <span className="text-xs text-slate-500">Demo only — no API call</span>
        </div>
      </form>
    </Card>
  );
};
