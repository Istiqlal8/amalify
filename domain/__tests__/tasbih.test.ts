import { expect, test } from '@jest/globals';

import { START, TASBIH_PRESETS, tap, totalDone, type TasbihState } from '../tasbih';

const sholat = TASBIH_PRESETS[0];
const bebas = TASBIH_PRESETS.find((p) => p.id === 'bebas')!;

function tapTimes(n: number, s: TasbihState = START): TasbihState {
  let state = s;
  for (let i = 0; i < n; i += 1) state = tap(sholat, state).state;
  return state;
}

test('test_tap_firstTap_countsOne', () => {
  expect(tap(sholat, START).state.count).toBe(1);
});

test('test_tap_reachesTarget_movesToNextPhrase', () => {
  const result = tap(sholat, tapTimes(32));
  expect(result.event).toBe('phraseDone');
  expect(result.state).toEqual({ phrase: 1, count: 0, finished: false });
});

test('test_tap_lastPhraseDone_finishesAtHundred', () => {
  const state = tapTimes(100);
  expect(state.finished).toBe(true);
  expect(totalDone(sholat, state)).toBe(100);
});

test('test_tap_afterFinished_staysPut', () => {
  const done = tapTimes(100);
  expect(tap(sholat, done).state).toBe(done);
});

test('test_tap_noTarget_countsWithoutEnd', () => {
  let state = START;
  for (let i = 0; i < 500; i += 1) state = tap(bebas, state).state;
  expect(state).toEqual({ phrase: 0, count: 500, finished: false });
});
