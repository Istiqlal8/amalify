import { expect, test } from '@jest/globals';

import { balance, buy, canBuy, chooseAnimal, chooseTheme, EMPTY_UNLOCKS, mergeUnlocks, owns, spent, type Unlocks } from '../shop';

const tulip = { kind: 'flower', id: 'tulip' } as const;
const fox = { kind: 'animal', id: 'fox' } as const;

test('test_owns_defaults_rabbitAndSakuraAreFree', () => {
  expect(owns(EMPTY_UNLOCKS, { kind: 'animal', id: 'rabbit' })).toBe(true);
  expect(owns(EMPTY_UNLOCKS, { kind: 'flower', id: 'sakura' })).toBe(true);
  expect(owns(EMPTY_UNLOCKS, tulip)).toBe(false);
});

test('test_owns_giftFlower_isOwnedAndFree', () => {
  const u: Unlocks = { ...EMPTY_UNLOCKS, gift: 'mawar', flowers: ['mawar'] };
  expect(owns(u, { kind: 'flower', id: 'mawar' })).toBe(true);
  expect(spent(u)).toBe(0);
});

test('test_buy_affordable_addsItemAndCharges', () => {
  const u = buy(150, EMPTY_UNLOCKS, tulip, 5);
  expect(u.flowers).toEqual(['tulip']);
  expect(balance(150, u)).toBe(50);
});

test('test_buy_unaffordable_returnsSameState', () => {
  expect(buy(50, EMPTY_UNLOCKS, tulip, 5)).toBe(EMPTY_UNLOCKS);
});

test('test_canBuy_alreadyOwned_isFalse', () => {
  expect(canBuy(999, { ...EMPTY_UNLOCKS, animals: ['fox'] }, fox)).toBe(false);
});

test('test_balance_spentMoreThanEarned_neverNegative', () => {
  expect(balance(10, { ...EMPTY_UNLOCKS, animals: ['fox'] })).toBe(0);
});

test('test_chooseAnimal_locked_isIgnored', () => {
  expect(chooseAnimal(EMPTY_UNLOCKS, 'fox', 9).animal).toBe('rabbit');
});

test('test_chooseAnimal_owned_switches', () => {
  expect(chooseAnimal({ ...EMPTY_UNLOCKS, animals: ['fox'] }, 'fox', 9)).toMatchObject({ animal: 'fox', at: 9 });
});

test('test_mergeUnlocks_purchases_areUnioned', () => {
  const a: Unlocks = { ...EMPTY_UNLOCKS, flowers: ['tulip'], at: 5 };
  const merged = mergeUnlocks(a, { ...EMPTY_UNLOCKS, flowers: ['mawar'], animals: ['cat'], at: 3 });
  expect(merged.flowers).toEqual(['tulip', 'mawar']);
  expect(merged.animals).toEqual(['cat']);
});

test('test_mergeUnlocks_newerRemote_winsAnimal', () => {
  const a: Unlocks = { ...EMPTY_UNLOCKS, animal: 'rabbit', at: 5 };
  expect(mergeUnlocks(a, { ...EMPTY_UNLOCKS, animals: ['cat'], animal: 'cat', at: 8 }).animal).toBe('cat');
});

test('test_mergeUnlocks_olderRemote_keepsLocalAnimal', () => {
  const a: Unlocks = { ...EMPTY_UNLOCKS, animals: ['fox'], animal: 'fox', at: 9 };
  expect(mergeUnlocks(a, { ...EMPTY_UNLOCKS, animal: 'rabbit', at: 2 }).animal).toBe('fox');
});

test('test_mergeUnlocks_junkRemote_isFilteredOrIgnored', () => {
  const a = EMPTY_UNLOCKS;
  expect(mergeUnlocks(a, undefined)).toBe(a);
  expect(mergeUnlocks(a, { flowers: ['dragon', 3], animals: ['unicorn'], at: 'x' }).flowers).toEqual([]);
});

test('test_buy_theme_addsThemeAndCharges', () => {
  const u = buy(400, EMPTY_UNLOCKS, { kind: 'theme', id: 'salju' }, 5);
  expect(u.themes).toEqual(['salju']);
  expect(balance(400, u)).toBe(100);
});

test('test_chooseTheme_lockedIgnored_ownedSwitches', () => {
  expect(chooseTheme(EMPTY_UNLOCKS, 'malam', 1).theme).toBe('musim-semi');
  expect(chooseTheme({ ...EMPTY_UNLOCKS, themes: ['malam'] }, 'malam', 1).theme).toBe('malam');
});

test('test_mergeUnlocks_newerRemote_winsTheme', () => {
  expect(mergeUnlocks(EMPTY_UNLOCKS, { ...EMPTY_UNLOCKS, themes: ['pantai'], theme: 'pantai', at: 4 }).theme).toBe('pantai');
});

test('test_mergeUnlocks_removedPigAndMouse_areDroppedAndFallBackToRabbit', () => {
  const merged = mergeUnlocks(EMPTY_UNLOCKS, { ...EMPTY_UNLOCKS, animals: ['pig', 'mouse', 'cat'], animal: 'mouse', at: 7 });
  expect(merged.animals).toEqual(['cat']);
  expect(merged.animal).toBe('rabbit');
});
