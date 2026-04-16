import type { Announcement } from './types';

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a-1',
    title: 'Community breakfast',
    body: 'Friday 8:30–10:00 in the lounge. RSVP optional—just show up with your mug.',
    postedOn: '2026-04-14',
    tag: 'Events',
  },
  {
    id: 'a-2',
    title: 'Quiet hours in Zone North',
    body: 'Headphones-on policy 9:00–17:00. Calls and meetings please use phone booths or south wing.',
    postedOn: '2026-04-10',
    tag: 'Policy',
  },
  {
    id: 'a-3',
    title: 'HVAC check — Central wing',
    body: 'Technicians may access the corridor Tuesday morning. Desks B1–B3 might hear brief noise.',
    postedOn: '2026-04-12',
    tag: 'Maintenance',
  },
];
