import type { FinanceCategory, FinanceDraft } from './personalFinance';

/** What could be read off a receipt; `amount` 0 and `day` null mean "not found". */
export type ReceiptGuess = { amount: number; note: string; day: string | null; category: FinanceCategory };

const TOTAL = /\b(grand\s*total|total|jumlah)\b/i;
const NOT_THE_TOTAL = /sub\s*total|total\s*(item|qty|disc|diskon|hemat)/i;
/** What the customer handed over and got back; often larger than the total itself. */
const PAYMENT = /tunai|cash|kembali|change|debit|kartu|dibayar/i;
const AMOUNT = /\b\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?\b|\b\d{3,9}(?:[.,]\d{2})?\b/g;
const GROUPED = /^\d{1,3}(?:[.,]\d{3})+/;
const YMD = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const DMY = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})\b/;
const TIME = /\b\d{1,2}:\d{2}(:\d{2})?\b/g;
const MIN_AMOUNT = 100;
/** Only the header is searched: item lines ("mie", "roti") would turn every minimarket into a restaurant. */
const HEADER_LINES = 3;
const SHOPS: [FinanceCategory, RegExp][] = [
  ['transport', /\b(pertamina|spbu|shell|vivo|pertalite|pertamax|parkir|tol|gojek|grab|kai)\b/i],
  ['kesehatan', /\b(apotek|apotik|farma|klinik|rumah sakit|rs|guardian|century|dokter)\b/i],
  ['tagihan', /\b(pln|listrik|pdam|telkom|indihome|pulsa|token)\b/i],
  ['pendidikan', /\b(gramedia|toko buku|sekolah|kampus|universitas|spp)\b/i],
  ['makan', /\b(resto|restoran|warung|rumah makan|rm|cafe|kafe|kopi|coffee|bakso|kfc|mcdonald|pizza|bakery|dapur)\b/i],
];
const NOTE_MAX = 80;

function linesOf(blocks: string[]): string[] {
  return blocks.flatMap((b) => b.split('\n')).map((l) => l.trim()).filter(Boolean);
}

/** Rupiah amounts on one line; dates and clock times are cut out first so they are not read as money. */
function amountsIn(line: string): number[] {
  const text = line.replace(YMD, ' ').replace(DMY, ' ').replace(TIME, ' ');
  return (text.match(AMOUNT) ?? [])
    .map((raw) => {
      const grouped = GROUPED.exec(raw);
      // "45.000,00" keeps its thousands and loses the cents; "45000,00" just loses the cents.
      return Number((grouped ? grouped[0] : raw.replace(/[.,]\d{2}$/, '')).replace(/\D/g, ''));
    })
    .filter((n) => n >= MIN_AMOUNT);
}

/** Amounts beside a "total" label, or on the next line when the label stands alone. */
function labelledTotals(lines: string[]): number[] {
  return lines.flatMap((line, i) => {
    if (!TOTAL.test(line) || NOT_THE_TOTAL.test(line)) return [];
    const here = amountsIn(line);
    const next = lines[i + 1] ?? '';
    return here.length > 0 || /[a-z]/i.test(next) ? here : amountsIn(next);
  });
}

function totalOf(lines: string[]): number {
  const labelled = labelledTotals(lines);
  const pool = labelled.length > 0 ? labelled : lines.filter((l) => !PAYMENT.test(l)).flatMap(amountsIn);
  return Math.max(0, ...pool);
}

function dateKeyOf(y: number, m: number, d: number): string | null {
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** The first date printed on the receipt that is real and not after `today`. */
function dayOf(lines: string[], today: string): string | null {
  for (const line of lines) {
    const ymd = YMD.exec(line);
    const dmy = DMY.exec(line);
    const year = dmy ? Number(dmy[3]) : 0;
    const key = ymd
      ? dateKeyOf(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]))
      : dmy
        ? dateKeyOf(year < 100 ? 2000 + year : year, Number(dmy[2]), Number(dmy[1]))
        : null;
    if (key && key <= today) return key;
  }
  return null;
}

/** The category a shop's name points to; anything unrecognised is plain shopping. */
function categoryOf(lines: string[]): FinanceCategory {
  const header = lines.slice(0, HEADER_LINES).join(' ');
  return SHOPS.find(([, words]) => words.test(header))?.[0] ?? 'belanja';
}

/** Reads total, shop name (the first line with letters) and date out of OCR text. */
export function parseReceipt(blocks: string[], today: string): ReceiptGuess {
  const lines = linesOf(blocks);
  const shop = lines.find((l) => /[a-z]{3}/i.test(l)) ?? '';
  return { amount: totalOf(lines), note: shop.slice(0, NOTE_MAX), day: dayOf(lines, today), category: categoryOf(lines) };
}

/** A receipt is an expense; the form opens on this and the user corrects what was misread. */
export function receiptDraft(guess: ReceiptGuess, today: string): FinanceDraft {
  return { kind: 'keluar', amount: guess.amount, category: guess.category, note: guess.note, day: guess.day ?? today };
}
