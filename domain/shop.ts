import { DEFAULT_FLOWER, type FlowerId, FLOWERS, isFlowerId } from './flowers';
import { type Animal, ANIMALS } from './groupFarm';
import { FREE_PET, isPetId, PET_PRICES, type PetId, PETS } from './pets';

export type AnimalId = Animal;
export const GARDEN_THEMES = ['musim-semi', 'sakura', 'pantai', 'salju', 'malam'] as const;
export type ThemeId = (typeof GARDEN_THEMES)[number];

/**
 * What the user has bought. Purchases only ever grow, so devices merge by union.
 * `gift` is the flower an existing user already had before the shop existed: owned, never charged.
 * `animal`, `theme` and `pet` (null = none) are the current choices; `at` stamps the last change for merging.
 */
export type Unlocks = {
  flowers: FlowerId[];
  animals: AnimalId[];
  themes: ThemeId[];
  pets: PetId[];
  animal: AnimalId;
  theme: ThemeId;
  pet: PetId | null;
  gift: FlowerId | null;
  at: number;
};

export const EMPTY_UNLOCKS: Unlocks = {
  flowers: [],
  animals: [],
  themes: [],
  pets: [],
  animal: 'rabbit',
  theme: 'musim-semi',
  pet: FREE_PET,
  gift: null,
  at: 0,
};

export type ShopItem =
  | { kind: 'flower'; id: FlowerId }
  | { kind: 'animal'; id: AnimalId }
  | { kind: 'theme'; id: ThemeId }
  | { kind: 'pet'; id: PetId };

/** Common flowers are cheap, showy ones pricey; sakura is the free default. */
export const FLOWER_PRICES: Record<FlowerId, number> = {
  daisy: 60,
  matahari: 60,
  melati: 80,
  tulip: 100,
  lavender: 120,
  mawar: 140,
  sepatu: 140,
  anggrek: 180,
  teratai: 200,
  sakura: 200,
};

export const ANIMAL_PRICES: Record<AnimalId, number> = { rabbit: 0, chick: 100, cat: 200, fox: 300 };

export const ANIMAL_NAMES: Record<AnimalId, string> = {
  rabbit: 'Kelinci',
  chick: 'Anak ayam',
  cat: 'Kucing',
  fox: 'Rubah',
};

export const THEME_PRICES: Record<ThemeId, number> = { 'musim-semi': 0, sakura: 150, pantai: 250, salju: 300, malam: 400 };

export const THEME_NAMES: Record<ThemeId, string> = {
  'musim-semi': 'Musim semi',
  sakura: 'Musim sakura',
  pantai: 'Pantai',
  salju: 'Musim salju',
  malam: 'Malam berbintang',
};

const FREE: Record<ShopItem['kind'], string> = { flower: DEFAULT_FLOWER, animal: 'rabbit', theme: 'musim-semi', pet: FREE_PET };

export function priceOf(item: ShopItem): number {
  if (item.kind === 'flower') return FLOWER_PRICES[item.id];
  if (item.kind === 'pet') return PET_PRICES[item.id];
  return item.kind === 'animal' ? ANIMAL_PRICES[item.id] : THEME_PRICES[item.id];
}

const isFree = (item: ShopItem) => FREE[item.kind] === item.id;

function bought(u: Unlocks, kind: ShopItem['kind']): string[] {
  const lists = { flower: u.flowers, animal: u.animals, theme: u.themes, pet: u.pets };
  return lists[kind];
}

export function owns(u: Unlocks, item: ShopItem): boolean {
  if (isFree(item) || (item.kind === 'flower' && item.id === u.gift)) return true;
  return bought(u, item.kind).includes(item.id);
}

/** Points spent on purchases; free items and the gift cost nothing. */
export function spent(u: Unlocks): number {
  const items: ShopItem[] = [
    ...u.flowers.filter((id) => id !== u.gift).map((id) => ({ kind: 'flower' as const, id })),
    ...u.animals.map((id) => ({ kind: 'animal' as const, id })),
    ...u.themes.map((id) => ({ kind: 'theme' as const, id })),
    ...u.pets.map((id) => ({ kind: 'pet' as const, id })),
  ];
  return items.filter((i) => !isFree(i)).reduce((sum, i) => sum + priceOf(i), 0);
}

export function balance(earned: number, u: Unlocks): number {
  return Math.max(0, earned - spent(u));
}

export function canBuy(earned: number, u: Unlocks, item: ShopItem): boolean {
  return !owns(u, item) && balance(earned, u) >= priceOf(item);
}

/** Returns the new unlock state, or `u` unchanged when the item is owned or unaffordable. */
export function buy(earned: number, u: Unlocks, item: ShopItem, now: number): Unlocks {
  if (!canBuy(earned, u, item)) return u;
  if (item.kind === 'flower') return { ...u, flowers: [...u.flowers, item.id], at: now };
  if (item.kind === 'animal') return { ...u, animals: [...u.animals, item.id], at: now };
  if (item.kind === 'pet') return { ...u, pets: [...u.pets, item.id], at: now };
  return { ...u, themes: [...u.themes, item.id], at: now };
}

export function chooseAnimal(u: Unlocks, id: AnimalId, now: number): Unlocks {
  return owns(u, { kind: 'animal', id }) && u.animal !== id ? { ...u, animal: id, at: now } : u;
}

export function chooseTheme(u: Unlocks, id: ThemeId, now: number): Unlocks {
  return owns(u, { kind: 'theme', id }) && u.theme !== id ? { ...u, theme: id, at: now } : u;
}

/** `null` walks without a pet. */
export function choosePet(u: Unlocks, id: PetId | null, now: number): Unlocks {
  if (id !== null && !owns(u, { kind: 'pet', id })) return u;
  return u.pet === id ? u : { ...u, pet: id, at: now };
}

const union = <T,>(a: T[], b: T[]) => [...new Set([...a, ...b])];
const listOf = <T extends string>(v: unknown, ok: (x: string) => x is T): T[] =>
  Array.isArray(v) ? v.filter((x): x is T => typeof x === 'string' && ok(x)) : [];
const isAnimal = (x: string): x is AnimalId => (ANIMALS as readonly string[]).includes(x);
const isTheme = (x: string): x is ThemeId => (GARDEN_THEMES as readonly string[]).includes(x);

/** Union of purchases; the current animal and theme come from whichever side changed last. Remote data is checked. */
export function mergeUnlocks(a: Unlocks, remote: unknown): Unlocks {
  if (typeof remote !== 'object' || remote === null) return a;
  const r = remote as Partial<Record<keyof Unlocks, unknown>>;
  const at = typeof r.at === 'number' ? r.at : 0;
  const gift = a.gift ?? (typeof r.gift === 'string' && isFlowerId(r.gift) ? r.gift : null);
  const merged = {
    flowers: union(a.flowers, listOf(r.flowers, isFlowerId)),
    animals: union(a.animals, listOf(r.animals, isAnimal)),
    themes: union(a.themes, listOf(r.themes, isTheme)),
    pets: union(a.pets, listOf(r.pets, isPetId)),
    gift,
  };
  if (at <= a.at) return { ...merged, animal: a.animal, theme: a.theme, pet: a.pet, at: a.at };
  const animal = typeof r.animal === 'string' && isAnimal(r.animal) ? r.animal : a.animal;
  const theme = typeof r.theme === 'string' && isTheme(r.theme) ? r.theme : a.theme;
  const pet = r.pet === null ? null : isPetId(r.pet) ? r.pet : a.pet;
  return { ...merged, animal, theme, pet, at };
}

export const SHOP_FLOWERS: ShopItem[] = FLOWERS.map((f) => ({ kind: 'flower', id: f.id }));
export const SHOP_ANIMALS: ShopItem[] = ANIMALS.map((id) => ({ kind: 'animal', id }));
export const SHOP_THEMES: ShopItem[] = GARDEN_THEMES.map((id) => ({ kind: 'theme', id }));
export const SHOP_PETS: ShopItem[] = PETS.map((id) => ({ kind: 'pet', id }));
