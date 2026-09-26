import { expect, test } from '@jest/globals';

import { ambienceFor, isGateCell, soundAllowed, stepDue } from '../farmSound';

test('test_ambienceFor_themes_matchTheirNature', () => {
  expect(ambienceFor('musim-semi')).toBe('birds');
  expect(ambienceFor('malam')).toBe('crickets');
  expect(ambienceFor('pantai')).toBe('waves');
});

test('test_ambienceFor_snow_isWind', () => {
  expect(ambienceFor('salju')).toBe('wind');
});

test('test_soundAllowed_murottalPlaying_isSilent', () => {
  expect(soundAllowed(true, true, true)).toBe(false);
});

test('test_soundAllowed_offOrInBackground_isSilent', () => {
  expect(soundAllowed(false, false, true)).toBe(false);
  expect(soundAllowed(true, false, false)).toBe(false);
});

test('test_soundAllowed_onAndQuiet_plays', () => {
  expect(soundAllowed(true, false, true)).toBe(true);
});

test('test_stepDue_tooSoon_waits', () => {
  expect(stepDue(1000, 1200)).toBe(false);
  expect(stepDue(1000, 1300)).toBe(true);
});

test('test_isGateCell_fieldGates_onlyThere', () => {
  expect(isGateCell(16, 1)).toBe(true); // top gate of the current month's field
  expect(isGateCell(16, 15)).toBe(true);
  expect(isGateCell(15, 1)).toBe(false);
});

test('test_isGateCell_yard_isNever', () => {
  expect(isGateCell(16, 17)).toBe(false);
});
