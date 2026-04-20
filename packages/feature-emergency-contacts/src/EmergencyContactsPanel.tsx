import React, { useState } from 'react';
import { Button, Card } from '@cowork/ui-components';

const CONTACTS: Array<{ id: string; label: string; detail: string; phone: string }> = [
  { id: 'security', label: 'Building security', detail: '24/7 lobby line', phone: '+1 (555) 010-0199' },
  { id: 'manager', label: 'Community manager', detail: 'Weekdays 9–18', phone: '+1 (555) 010-0144' },
  { id: 'maintenance', label: 'Facilities', detail: 'HVAC, leaks, access', phone: '+1 (555) 010-0177' },
];

async function copyPhone(phone: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(phone);
    return true;
  } catch {
    return false;
  }
}

/** Quick-reference safety and ops numbers with copy-to-clipboard (demo numbers). */
export const EmergencyContactsPanel: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2200);
  };

  return (
    <Card
      title="Safety & facilities"
      description="Keep these handy for incidents or urgent building issues. Demo phone numbers only."
    >
      <div className="space-y-4">
        {status ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
            {status}
          </p>
        ) : null}

        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
          {CONTACTS.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                <p className="text-xs text-slate-500">{row.detail}</p>
                <p className="mt-1 font-mono text-sm font-medium text-slate-800">{row.phone}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 !text-xs"
                onClick={async () => {
                  const ok = await copyPhone(row.phone);
                  flash(ok ? `${row.label} number copied.` : 'Copy failed — select the number manually.');
                }}
              >
                Copy number
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
