import React, { useState } from 'react';
import { Button, Card } from '@cowork/ui-components';

const DEMO_SSID = 'Workspace-Guest';
const DEMO_PASSWORD = 'welcome2026';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Member-facing guest Wi‑Fi details with one-tap copy (demo values). */
export const WifiGuestPass: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2200);
  };

  const onCopy = async (label: string, value: string) => {
    const ok = await copyText(value);
    flash(ok ? `${label} copied to clipboard.` : 'Copy failed — select the text manually.');
  };

  const mono = 'font-mono text-sm font-semibold tracking-wide text-slate-900';

  return (
    <Card
      title="Guest Wi‑Fi"
      description="Share with visitors at reception. Demo credentials only — replace in production."
    >
      <div className="space-y-4">
        {status ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
            {status}
          </p>
        ) : null}

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Network name</p>
          <p className={`${mono} mt-1`}>{DEMO_SSID}</p>
          <Button type="button" variant="secondary" className="mt-3 !text-xs" onClick={() => onCopy('Network name', DEMO_SSID)}>
            Copy SSID
          </Button>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</p>
          <p className={`${mono} mt-1`}>{DEMO_PASSWORD}</p>
          <Button type="button" variant="secondary" className="mt-3 !text-xs" onClick={() => onCopy('Password', DEMO_PASSWORD)}>
            Copy password
          </Button>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto"
          onClick={async () => {
            const line = `SSID: ${DEMO_SSID}\nPassword: ${DEMO_PASSWORD}`;
            const ok = await copyText(line);
            flash(ok ? 'SSID and password copied together.' : 'Copy failed — select the text manually.');
          }}
        >
          Copy both
        </Button>
      </div>
    </Card>
  );
};
