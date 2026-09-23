export type FlowerId =
  | 'sakura'
  | 'matahari'
  | 'mawar'
  | 'tulip'
  | 'melati'
  | 'daisy'
  | 'lavender'
  | 'anggrek'
  | 'teratai'
  | 'sepatu';

/** `petal` is the colour of the petals that fall at 100%; null follows the colour theme. */
export const FLOWERS: { id: FlowerId; name: string; petal: string | null }[] = [
  { id: 'sakura', name: 'Sakura', petal: null },
  { id: 'matahari', name: 'Matahari', petal: '#FACC15' },
  { id: 'mawar', name: 'Mawar', petal: '#E11D48' },
  { id: 'tulip', name: 'Tulip', petal: '#F97316' },
  { id: 'melati', name: 'Melati', petal: '#FFFFFF' },
  { id: 'daisy', name: 'Daisy', petal: '#F8FAFC' },
  { id: 'lavender', name: 'Lavender', petal: '#A78BFA' },
  { id: 'anggrek', name: 'Anggrek', petal: '#C026D3' },
  { id: 'teratai', name: 'Teratai', petal: '#F9A8D4' },
  { id: 'sepatu', name: 'Kembang sepatu', petal: '#DC2626' },
];

export const DEFAULT_FLOWER: FlowerId = 'sakura';

export function isFlowerId(value: string): value is FlowerId {
  return FLOWERS.some((f) => f.id === value);
}

/** Only sakura grows as a tree; the rest are shrubs, clumps and stalks. */
export function isTree(flower: FlowerId): boolean {
  return flower === 'sakura';
}
