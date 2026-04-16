import React from 'react';
import { Button, Badge } from '@cowork/ui-components';
import type { Announcement, AnnouncementTag } from '../types';

const tagBadge: Record<AnnouncementTag, 'blue' | 'yellow' | 'red'> = {
  Events: 'blue',
  Policy: 'yellow',
  Maintenance: 'red',
};

export interface AnnouncementCardProps {
  item: Announcement;
  onDismiss: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ item, onDismiss }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100/80 pb-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={tagBadge[item.tag]}>{item.tag}</Badge>
          <span className="text-xs font-medium tabular-nums text-slate-500">{item.postedOn}</span>
        </div>
        <h3 className="text-base font-semibold tracking-tight text-slate-900">{item.title}</h3>
      </div>
      <Button type="button" variant="ghost" className="!px-3 !py-2 !text-xs shrink-0" onClick={() => onDismiss(item.id)}>
        Dismiss
      </Button>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
  </div>
);
