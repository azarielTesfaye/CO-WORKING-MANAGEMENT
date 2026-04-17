import React, { useEffect, useState } from 'react';
import { Button, Card, Badge } from '@cowork/ui-components';
import { formatDate, formatTime, loadFromLocal, saveToLocal } from '@cowork/utils';

const STORAGE_KEY = 'supplyRequests';

const ITEMS = ['Coffee pods', 'Tea', 'Printer paper', 'Whiteboard markers', 'Hand soap', 'Other'] as const;

interface SupplyRequest {
  id: string;
  item: string;
  note: string;
  createdAt: string;
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15';

/** Log supply restocks for ops; queue is stored in localStorage. */
export const SupplyRequestBoard: React.FC = () => {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [item, setItem] = useState<string>(ITEMS[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRequests(loadFromLocal<SupplyRequest[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    saveToLocal(STORAGE_KEY, requests);
  }, [requests]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item === 'Other' && !note.trim()) {
      setError('Add a short note when choosing Other.');
      return;
    }
    setError(null);
    const id = crypto.randomUUID?.() ?? `sr-${Date.now()}`;
    const createdAt = new Date().toISOString();
    setRequests((prev) => [{ id, item, note: note.trim(), createdAt }, ...prev]);
    setNote('');
  };

  const remove = (id: string) => setRequests((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="space-y-8">
      <Card
        title="Supply requests"
        description="Let ops know what ran out. Requests stay in this browser until cleared."
      >
        <form onSubmit={submit} className="space-y-5">
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {error}
            </p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="supply-item" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Item
              </label>
              <select
                id="supply-item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className={fieldClass}
              >
                {ITEMS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="supply-note" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Note
              </label>
              <input
                id="supply-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={fieldClass}
                placeholder="Quantity, brand, location…"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <Button type="submit">Submit request</Button>
            <span className="text-xs text-slate-500">Demo — no email or ticket is sent</span>
          </div>
        </form>
      </Card>

      <Card title="Open queue" description="Newest first. Remove rows when restocked.">
        {requests.length === 0 ? (
          <p className="text-sm text-slate-600">No open supply requests.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => {
              const at = new Date(r.createdAt);
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="yellow">{r.item}</Badge>
                      <span className="text-xs text-slate-500">
                        {formatDate(at)} · {formatTime(at)}
                      </span>
                    </div>
                    {r.note ? <p className="mt-1 text-sm text-slate-700">{r.note}</p> : null}
                  </div>
                  <Button type="button" variant="ghost" className="!self-start !py-1.5 !text-xs sm:!self-center" onClick={() => remove(r.id)}>
                    Done
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};
