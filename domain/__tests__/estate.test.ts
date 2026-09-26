import { expect, test } from '@jest/globals';

import { HOUSE_PRICES, isHouseId, isMountId, MOUNT_PRICES } from '../estate';
import { buy, chooseHouse, chooseMount, EMPTY_UNLOCKS, mergeUnlocks, owns, spent } from '../shop';

const horse = { kind: 'mount', id: 'kuda' } as const;
const manor = { kind: 'house', id: 'mewah' } as const;

test('test_prices_horseAndHouses_arePricey', () => {
  expect(MOUNT_PRICES.kuda).toBe(500);
  expect(HOUSE_PRICES.kayu).toBe(0);
  expect(HOUSE_PRICES.mewah).toBeGreaterThan(HOUSE_PRICES.bata);
});

test('test_isMountId_andIsHouseId_rejectUnknown', () => {
  expect(isMountId('unta')).toBe(false);
  expect(isHouseId('istana')).toBe(false);
});

test('test_owns_defaults_woodenHouseButNoHorse', () => {
  expect(owns(EMPTY_UNLOCKS, { kind: 'house', id: 'kayu' })).toBe(true);
  expect(owns(EMPTY_UNLOCKS, horse)).toBe(false);
});

test('test_buy_horse_addsAndCharges', () => {
  const u = buy(600, EMPTY_UNLOCKS, horse, 1);
  expect(u.mounts).toEqual(['kuda']);
  expect(spent(u)).toBe(500);
});

test('test_chooseMount_lockedIgnored_ownedOrNoneSwitches', () => {
  expect(chooseMount(EMPTY_UNLOCKS, 'kuda', 1).mount).toBeNull();
  const owned = { ...EMPTY_UNLOCKS, mounts: ['kuda' as const] };
  expect(chooseMount(owned, 'kuda', 1).mount).toBe('kuda');
  expect(chooseMount({ ...owned, mount: 'kuda' }, null, 2).mount).toBeNull();
});

test('test_chooseHouse_boughtManor_isUsed', () => {
  const u = buy(2000, EMPTY_UNLOCKS, manor, 1);
  expect(chooseHouse(u, 'mewah', 2).house).toBe('mewah');
});

test('test_mergeUnlocks_mountsAndHouses_unionAndNewerChoice', () => {
  const remote = { ...EMPTY_UNLOCKS, mounts: ['kuda', 'unta'], houses: ['bata'], mount: 'kuda', house: 'bata', at: 5 };
  const merged = mergeUnlocks(EMPTY_UNLOCKS, remote);
  expect(merged.mounts).toEqual(['kuda']);
  expect(merged).toMatchObject({ houses: ['bata'], mount: 'kuda', house: 'bata' });
});
