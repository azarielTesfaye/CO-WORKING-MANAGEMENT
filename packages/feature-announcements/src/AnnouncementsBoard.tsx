import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@cowork/ui-components';
import { loadFromLocal, saveToLocal } from '@cowork/utils';
import { SEED_ANNOUNCEMENTS } from './seed';
import { AnnouncementCard } from './components/AnnouncementCard';
import type { AnnouncementTag } from './types';

const FILTERS: Array<'all' | AnnouncementTag> = ['all', 'Events', 'Policy', 'Maintenance'];
const STORAGE_KEY = 'announcementDismissedIds';

/** Workspace notices: filter by tag, dismiss items (stored in localStorage). */
export const AnnouncementsBoard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | AnnouncementTag>('all');
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(loadFromLocal<string[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    saveToLocal(STORAGE_KEY, dismissed);
  }, [dismissed]);

  const visible = useMemo(() => {
    return SEED_ANNOUNCEMENTS.filter((a) => {
      if (dismissed.includes(a.id)) return false;
      if (filter === 'all') return true;
      return a.tag === filter;
    });
  }, [filter, dismissed]);

  const restoreAll = () => setDismissed([]);

  return (
    <Card
      title="Workspace announcements"
      description="Notices for members. Dismissals are saved in this browser only."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((key) => (
            <Button
              key={key}
              type="button"
              variant={filter === key ? 'primary' : 'secondary'}
              className="!px-3 !py-2 !text-xs"
              onClick={() => setFilter(key)}
            >
              {key === 'all' ? 'All' : key}
            </Button>
          ))}
          {dismissed.length > 0 ? (
            <Button type="button" variant="ghost" className="!px-3 !py-2 !text-xs" onClick={restoreAll}>
              Restore dismissed
            </Button>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-600">
            No announcements in this view. Try another filter or restore dismissed items.
          </p>
        ) : (
          <ul className="space-y-4">
            {visible.map((item) => (
              <li key={item.id}>
                <AnnouncementCard
                  item={item}
                  onDismiss={(id) =>
                    setDismissed((prev) => (prev.includes(id) ? prev : [...prev, id]))
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};
