export type AnnouncementTag = 'Events' | 'Policy' | 'Maintenance';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  postedOn: string;
  tag: AnnouncementTag;
}
