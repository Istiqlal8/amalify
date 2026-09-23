import { expect, test } from '@jest/globals';

import { eventRatio, eventStatus, sortEvents, type GroupEvent } from '../groupEvent';

const at = (y: number, mo: number, d: number, h = 9) => new Date(y, mo - 1, d, h).toISOString();
const ev = (over: Partial<GroupEvent> = {}): GroupEvent => ({
  id: 'e', groupId: 'g', title: 'Kajian', startsAt: at(2026, 9, 25), pic: null,
  target: 1, unit: '', progress: 0, createdBy: 'u', ...over,
});

test('test_eventStatus_progressReachesTarget_terlaksana', () => {
  expect(eventStatus(ev({ target: 30, progress: 30 }), new Date(2026, 8, 20))).toBe('terlaksana');
});

test('test_eventStatus_laterSameDay_stillBelum', () => {
  expect(eventStatus(ev(), new Date(2026, 8, 25, 22))).toBe('belum');
});

test('test_eventStatus_dayPassedUnfinished_tidak', () => {
  expect(eventStatus(ev({ target: 30, progress: 12 }), new Date(2026, 8, 26))).toBe('tidak');
});

test('test_eventRatio_overTarget_capsAtOne', () => {
  expect(eventRatio(ev({ target: 10, progress: 15 }))).toBe(1);
});

test('test_sortEvents_upcomingSoonestThenPastLatest', () => {
  const now = new Date(2026, 8, 23, 12);
  const list = [ev({ id: 'past1', startsAt: at(2026, 9, 1) }), ev({ id: 'soon2', startsAt: at(2026, 9, 30) }),
    ev({ id: 'soon1', startsAt: at(2026, 9, 24) }), ev({ id: 'past2', startsAt: at(2026, 9, 20) })];
  expect(sortEvents(list, now).map((e) => e.id)).toEqual(['soon1', 'soon2', 'past2', 'past1']);
});
