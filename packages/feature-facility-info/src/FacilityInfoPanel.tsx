import React from 'react';
import { Card, Badge } from '@cowork/ui-components';

/** Returns whether the space is "open" for the badge, using the viewer's local clock (demo). */
function useOpenNow(): boolean {
  return React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 0) {
      return false;
    }
    if (day === 6) {
      return hour >= 10 && hour < 16;
    }
    return hour >= 8 && hour < 20;
  }, []);
}

const rows: { label: string; value: string }[] = [
  { label: 'Mon–Fri', value: '8:00 – 20:00' },
  { label: 'Saturday', value: '10:00 – 16:00' },
  { label: 'Sunday', value: 'Closed' },
  { label: 'Front desk', value: 'Ext. 1200 · lobby' },
  { label: 'Quiet zone', value: 'Floor 2, north wing' },
];

/** At-a-glance hours and building orientation for members (demo content). */
export const FacilityInfoPanel: React.FC = () => {
  const openNow = useOpenNow();

  return (
    <Card
      title="Space and hours"
      description="Quick reference for how to use the building. Configure real values for your site."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
        <Badge color={openNow ? 'green' : 'red'}>{openNow ? 'Open' : 'Outside staffed hours'}</Badge>
      </div>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex flex-col gap-0.5 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.label}</span>
            <span className="text-sm font-medium text-slate-900">{row.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
