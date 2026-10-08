import { expect, test } from '@jest/globals';

import { cityQuery, pickCity } from '../cityMatch';

const BANDUNG = [
  { id: '1201', name: 'KAB. BANDUNG' },
  { id: '1202', name: 'KAB. BANDUNG BARAT' },
  { id: '1219', name: 'KOTA BANDUNG' },
];

test('test_cityQuery_kabupaten_givesKabKind', () => {
  expect(cityQuery('Kabupaten Sleman')).toEqual({ kind: 'KAB.', keywords: ['sleman'] });
});

test('test_cityQuery_multiWord_shrinksFromTheEnd', () => {
  expect(cityQuery('Kota Jakarta Selatan')).toEqual({ kind: 'KOTA', keywords: ['jakarta selatan', 'jakarta'] });
});

test('test_cityQuery_administrasi_isDropped', () => {
  expect(cityQuery('Kota Administrasi Jakarta Timur').keywords).toEqual(['jakarta timur', 'jakarta']);
});

test('test_cityQuery_noPrefix_hasNoKind', () => {
  expect(cityQuery('Bandung')).toEqual({ kind: null, keywords: ['bandung'] });
});

test('test_pickCity_kabupatenAsked_picksKabupaten', () => {
  expect(pickCity(BANDUNG, 'KAB.', 'bandung')?.id).toBe('1201');
});

test('test_pickCity_noKind_prefersKota', () => {
  expect(pickCity(BANDUNG, null, 'bandung')?.id).toBe('1219');
});

test('test_pickCity_longerName_matchesExactly', () => {
  expect(pickCity(BANDUNG, 'KAB.', 'bandung barat')?.id).toBe('1202');
});

test('test_pickCity_noExactName_returnsUndefined', () => {
  expect(pickCity(BANDUNG, 'KOTA', 'band')).toBeUndefined();
});
