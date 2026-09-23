import type { HaidLog } from './haid';

export type Flow = 'flek' | 'ringan' | 'sedang' | 'deras';

export const FLOWS: { id: Flow; label: string }[] = [
  { id: 'flek', label: 'Flek' },
  { id: 'ringan', label: 'Ringan' },
  { id: 'sedang', label: 'Sedang' },
  { id: 'deras', label: 'Deras' },
];

/** Index is the stored pain level, 0 = no pain. */
export const PAINS = ['Tidak nyeri', 'Ringan', 'Sedang', 'Berat', 'Sangat berat'];

export const SYMPTOMS = [
  'Kram',
  'Jerawat',
  'Kembung',
  'Sakit punggung',
  'Lelah',
  'Pusing',
  'Mood naik turun',
  'Mual',
  'Payudara nyeri',
  'Susah tidur',
  'Sedih',
];

/** What was felt on one day; kept apart from `periods`, which decide the sholat pause. */
export type DayNote = { flow?: Flow; pain?: number; symptoms: string[] };

export const EMPTY_NOTE: DayNote = { symptoms: [] };

export function noteOf(log: HaidLog, day: string): DayNote {
  return log.days?.[day] ?? EMPTY_NOTE;
}

function isEmpty(note: DayNote): boolean {
  return note.flow === undefined && note.pain === undefined && note.symptoms.length === 0;
}

/** Stores `note` for `day`; an empty note is dropped instead of kept as a blank entry. */
export function setDayNote(log: HaidLog, day: string, note: DayNote, now: number): HaidLog {
  const days = { ...log.days };
  if (isEmpty(note)) delete days[day];
  else days[day] = note;
  return { ...log, days, at: now };
}

export function toggleSymptom(note: DayNote, symptom: string): DayNote {
  const has = note.symptoms.includes(symptom);
  return { ...note, symptoms: has ? note.symptoms.filter((s) => s !== symptom) : [...note.symptoms, symptom] };
}

/** Symptoms typed in by the user at some point, so they come back as chips. */
export function customSymptoms(log: HaidLog): string[] {
  const all = Object.values(log.days ?? {}).flatMap((n) => n.symptoms);
  return [...new Set(all)].filter((s) => !SYMPTOMS.includes(s)).sort();
}
