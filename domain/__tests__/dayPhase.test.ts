import { describe, expect, it } from '@jest/globals';

import { darknessOf, hourNow, isDark, phaseAt, tintOf } from '../dayPhase';

describe('phaseAt', () => {
  it('buckets the day by local hour', () => {
    expect(phaseAt(2)).toBe('malam');
    expect(phaseAt(5)).toBe('subuh');
    expect(phaseAt(7)).toBe('pagi');
    expect(phaseAt(12)).toBe('siang');
    expect(phaseAt(16)).toBe('sore');
    expect(phaseAt(18)).toBe('senja');
    expect(phaseAt(21)).toBe('malam');
  });

  it('wraps hours past midnight and negative values', () => {
    expect(phaseAt(25)).toBe(phaseAt(1));
    expect(phaseAt(-1)).toBe('malam');
    expect(phaseAt(31)).toBe('pagi');
  });
});

describe('darknessOf / isDark', () => {
  it('is darkest at night and clear at noon', () => {
    expect(darknessOf('siang')).toBe(0);
    expect(darknessOf('malam')).toBeGreaterThan(darknessOf('senja'));
    expect(isDark('malam')).toBe(true);
    expect(isDark('siang')).toBe(false);
    expect(isDark('pagi')).toBe(false);
  });
});

describe('tintOf', () => {
  it('returns a transparent tint at noon and a blue one at night', () => {
    expect(tintOf('siang')).toContain('0,0,0,0');
    expect(tintOf('malam')).toContain('22,30,78');
  });
});

describe('hourNow', () => {
  it('reads the clock as a decimal hour', () => {
    expect(hourNow(new Date(2026, 0, 1, 13, 30))).toBeCloseTo(13.5);
    expect(hourNow(new Date(2026, 0, 1, 0, 0))).toBe(0);
  });
});