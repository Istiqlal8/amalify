export type GroupEvent = {
  id: string;
  groupId: string;
  title: string;
  /** ISO timestamp. */
  startsAt: string;
  /** Member in charge; null when unassigned or the member left. */
  pic: string | null;
  /** 1 for a check event. */
  target: number;
  /** Empty for a check event, e.g. "juz" for a counted one. */
  unit: string;
  progress: number;
  createdBy: string;
};

export type EventDraft = Pick<GroupEvent, 'title' | 'startsAt' | 'pic' | 'target' | 'unit'>;

export type EventStatus = 'terlaksana' | 'belum' | 'tidak';

export const STATUS_LABELS: Record<EventStatus, string> = {
  terlaksana: 'Terlaksana',
  belum: 'Akan datang',
  tidak: 'Tidak terlaksana',
};

/** Done once progress reaches the target; missed when its day has ended without that. */
export function eventStatus(event: GroupEvent, now: Date): EventStatus {
  if (event.progress >= event.target) return 'terlaksana';
  const endOfDay = new Date(event.startsAt);
  endOfDay.setHours(23, 59, 59, 999);
  return now > endOfDay ? 'tidak' : 'belum';
}

export function eventRatio(event: GroupEvent): number {
  return Math.min(event.progress / event.target, 1);
}

/** Upcoming first (soonest on top), then past ones (latest on top). */
export function sortEvents(events: GroupEvent[], now: Date): GroupEvent[] {
  const t = now.getTime();
  const time = (e: GroupEvent) => new Date(e.startsAt).getTime();
  const upcoming = events.filter((e) => time(e) >= t).sort((a, b) => time(a) - time(b));
  const past = events.filter((e) => time(e) < t).sort((a, b) => time(b) - time(a));
  return [...upcoming, ...past];
}
