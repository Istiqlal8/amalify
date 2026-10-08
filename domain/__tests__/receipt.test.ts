import { expect, test } from '@jest/globals';

import { parseReceipt, receiptDraft } from '../receipt';

const TODAY = '2026-10-08';

const MINIMARKET = [
  'INDOMARET\nJL. SUDIRMAN NO 12\nTelp 0812345678901',
  '07/10/2026 14:32',
  'INDOMIE GORENG 2 3.100 6.200',
  'AQUA 600ML 1 4.500 4.500',
  'SUBTOTAL 10.700',
  'TOTAL 10.700',
  'TUNAI 20.000',
  'KEMBALI 9.300',
];

test('test_parseReceipt_labelledTotal_ignoresCashPaid', () => {
  expect(parseReceipt(MINIMARKET, TODAY).amount).toBe(10700);
});

test('test_parseReceipt_firstTextLine_isTheShop', () => {
  expect(parseReceipt(MINIMARKET, TODAY).note).toBe('INDOMARET');
});

test('test_parseReceipt_dmyDate_becomesDateKey', () => {
  expect(parseReceipt(MINIMARKET, TODAY).day).toBe('2026-10-07');
});

test('test_parseReceipt_totalLabelAlone_readsNextLine', () => {
  expect(parseReceipt(['Warung Bu Sri', 'Total', 'Rp 45.000,00'], TODAY).amount).toBe(45000);
});

test('test_parseReceipt_noLabel_takesLargestNonPayment', () => {
  expect(parseReceipt(['Toko A', 'Beras 62500', 'Gula 15000', 'Cash 100000'], TODAY).amount).toBe(62500);
});

test('test_parseReceipt_commaThousands_areRead', () => {
  expect(parseReceipt(['Cafe', 'GRAND TOTAL 1,250,000'], TODAY).amount).toBe(1250000);
});

test('test_parseReceipt_futureDate_isRejected', () => {
  expect(parseReceipt(['Toko', '2026-12-01', 'Total 5.000'], TODAY).day).toBeNull();
});

test('test_parseReceipt_nothingReadable_isEmpty', () => {
  expect(parseReceipt([], TODAY)).toEqual({ amount: 0, note: '', day: null, category: 'belanja' });
});

test('test_parseReceipt_fuelStation_isTransport', () => {
  expect(parseReceipt(['SPBU PERTAMINA 34.123', 'Pertalite 10.000'], TODAY).category).toBe('transport');
});

test('test_parseReceipt_itemNames_doNotDecideCategory', () => {
  expect(parseReceipt(MINIMARKET, TODAY).category).toBe('belanja');
});

test('test_receiptDraft_missingDay_fallsBackToToday', () => {
  expect(receiptDraft({ amount: 5000, note: 'Toko', day: null, category: 'belanja' }, TODAY)).toEqual({
    kind: 'keluar', amount: 5000, category: 'belanja', note: 'Toko', day: TODAY,
  });
});
