import React, { useEffect, useState } from 'react';
import { Button, Card, Badge } from '@cowork/ui-components';
import { formatDate, formatTime, loadFromLocal, saveToLocal } from '@cowork/utils';

const STORAGE_KEY = 'lostFoundPosts';

type Kind = 'lost' | 'found';

interface Post {
  id: string;
  kind: Kind;
  title: string;
  location: string;
  note: string;
  createdAt: string;
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15';

/** Member-posted lost & found notices stored in localStorage. */
export const LostFoundBoard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [kind, setKind] = useState<Kind>('lost');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosts(loadFromLocal<Post[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    saveToLocal(STORAGE_KEY, posts);
  }, [posts]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const loc = location.trim();
    if (!t || !loc) {
      setError('Title and last-seen / found location are required.');
      return;
    }
    setError(null);
    const id = crypto.randomUUID?.() ?? `lf-${Date.now()}`;
    setPosts((prev) => [
      {
        id,
        kind,
        title: t,
        location: loc,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setTitle('');
    setLocation('');
    setNote('');
  };

  const remove = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-8">
      <Card
        title="Lost & found"
        description="Post what went missing or what you turned in at reception. Data stays in this browser."
      >
        <form onSubmit={submit} className="space-y-5">
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {(['lost', 'found'] as const).map((k) => (
              <Button
                key={k}
                type="button"
                variant={kind === k ? 'primary' : 'secondary'}
                className="!px-3 !py-2 !text-xs capitalize"
                onClick={() => setKind(k)}
              >
                {k}
              </Button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="lf-title" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Short title
              </label>
              <input
                id="lf-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
                placeholder="e.g. Black water bottle"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lf-loc" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Last seen / where found
              </label>
              <input
                id="lf-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClass}
                placeholder="Hot desk zone B, kitchen…"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lf-note" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Details (optional)
              </label>
              <textarea
                id="lf-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className={`${fieldClass} resize-y`}
                placeholder="Stickers, serial, contact preference…"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <Button type="submit">Post notice</Button>
            <span className="text-xs text-slate-500">Demo — not visible to other members</span>
          </div>
        </form>
      </Card>

      <Card title="Your notices" description="Newest first. Remove when resolved.">
        {posts.length === 0 ? (
          <p className="text-sm text-slate-600">No posts yet.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => {
              const at = new Date(p.createdAt);
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={p.kind === 'lost' ? 'yellow' : 'green'}>{p.kind}</Badge>
                      <span className="font-semibold text-slate-900">{p.title}</span>
                    </div>
                    <Button type="button" variant="ghost" className="!py-1.5 !text-xs" onClick={() => remove(p.id)}>
                      Remove
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{p.location}</p>
                  {p.note ? <p className="mt-2 text-sm text-slate-700">{p.note}</p> : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(at)} · {formatTime(at)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};
