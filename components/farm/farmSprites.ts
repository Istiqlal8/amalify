import type { ImageSourcePropType } from 'react-native';

import type { Facing } from '@/domain/farm';
import type { Animal } from '@/domain/groupFarm';
import type { PetId } from '@/domain/pets';
import type { ThemeId } from '@/domain/shop';

// All farm art lives behind this file; built by scripts/build-farm-assets.py
// (CoMiGo "Farm, Puzzle & Animals" + Kenney Medieval RTS, both CC0).

export type Particles = 'petals' | 'snow' | 'fireflies' | null;

/**
 * Per garden theme: the Kebun world tiles (houses on top, one tile per month, closing trees), the
 * group farm scene (one open field), the grass colour past the scene's edge, the shop preview and
 * runtime extras.
 */
export type ThemeArt = {
  world: { top: ImageSourcePropType; month: ImageSourcePropType; bottom: ImageSourcePropType };
  groupScene: ImageSourcePropType;
  fill: string;
  preview: ImageSourcePropType;
  particles: Particles;
  night: boolean;
};

const BASE = {
  world: { top: require('@/assets/farm/world_top.png'), month: require('@/assets/farm/world_month.png'), bottom: require('@/assets/farm/world_bottom.png') },
  groupScene: require('@/assets/farm/scene_group.png'),
  fill: '#63A642',
};

export const THEME_ART: Record<ThemeId, ThemeArt> = {
  'musim-semi': { ...BASE, preview: require('@/assets/farm/theme_musim-semi.png'), particles: null, night: false },
  sakura: {
    world: { top: require('@/assets/farm/world_top_sakura.png'), month: require('@/assets/farm/world_month_sakura.png'), bottom: require('@/assets/farm/world_bottom_sakura.png') },
    groupScene: require('@/assets/farm/scene_group_sakura.png'),
    fill: '#88AE68',
    preview: require('@/assets/farm/theme_sakura.png'),
    particles: 'petals',
    night: false,
  },
  pantai: {
    world: { top: require('@/assets/farm/world_top_pantai.png'), month: require('@/assets/farm/world_month_pantai.png'), bottom: require('@/assets/farm/world_bottom_pantai.png') },
    groupScene: require('@/assets/farm/scene_group_pantai.png'),
    fill: '#F0DBA8',
    preview: require('@/assets/farm/theme_pantai.png'),
    particles: null,
    night: false,
  },
  salju: {
    world: { top: require('@/assets/farm/world_top_salju.png'), month: require('@/assets/farm/world_month_salju.png'), bottom: require('@/assets/farm/world_bottom_salju.png') },
    groupScene: require('@/assets/farm/scene_group_salju.png'),
    fill: '#F0F6FC',
    preview: require('@/assets/farm/theme_salju.png'),
    particles: 'snow',
    night: false,
  },
  // Night tints the scene at runtime; the fill is the grass under the same tint.
  malam: { ...BASE, fill: '#3D6248', preview: require('@/assets/farm/theme_malam.png'), particles: 'fireflies', night: true },
};

const ANIMAL_ART = {
  rabbit: {
    down: require('@/assets/farm/rabbit_down.png'),
    left: require('@/assets/farm/rabbit_left.png'),
    up: require('@/assets/farm/rabbit_up.png'),
    right: require('@/assets/farm/rabbit_right.png'),
  },
  chick: {
    down: require('@/assets/farm/chick_down.png'),
    left: require('@/assets/farm/chick_left.png'),
    up: require('@/assets/farm/chick_up.png'),
    right: require('@/assets/farm/chick_right.png'),
  },
  cat: {
    down: require('@/assets/farm/cat_down.png'),
    left: require('@/assets/farm/cat_left.png'),
    up: require('@/assets/farm/cat_up.png'),
    right: require('@/assets/farm/cat_right.png'),
  },
  fox: {
    down: require('@/assets/farm/fox_down.png'),
    left: require('@/assets/farm/fox_left.png'),
    up: require('@/assets/farm/fox_up.png'),
    right: require('@/assets/farm/fox_right.png'),
  },
};
/** Characters per animal and facing. Square sprites, one cell wide, feet at the bottom. */
export const CHARACTERS: Record<Animal, Record<Facing, ImageSourcePropType>> = ANIMAL_ART;
/** Hop height while walking, as a fraction of the cell width. */
export const CHARACTER_HOP = 0.08;

/** Empty soil bed: square, one cell wide, bottom-anchored to its cell. Baked into SCENE, drawn as a sprite on SCENE_GROUP. */
export const BED_BLANK = require('@/assets/farm/bed_blank.png');
/** Where the bed sits inside that square (fractions of its height); plants are rooted at `root`. */
export const BED_BOX = { top: 0.44, bottom: 0.99, root: 0.78 };
/** Plant art width as a fraction of the cell; trees grow taller than the bed and overlap the row above. */
export const PLANT_WIDTH = { tree: 1.4, plant: 1.1 };

/** Pets per facing, drawn at PET_SIZE of a cell. */
export const PET_SIZE = 0.75;
export const PET_ART: Record<PetId, Record<Facing, ImageSourcePropType>> = {
  kucing: {
    down: require('@/assets/farm/pet_kucing_down.png'),
    left: require('@/assets/farm/pet_kucing_left.png'),
    up: require('@/assets/farm/pet_kucing_up.png'),
    right: require('@/assets/farm/pet_kucing_right.png'),
  },
  'anak-ayam': {
    down: require('@/assets/farm/pet_anak-ayam_down.png'),
    left: require('@/assets/farm/pet_anak-ayam_left.png'),
    up: require('@/assets/farm/pet_anak-ayam_up.png'),
    right: require('@/assets/farm/pet_anak-ayam_right.png'),
  },
  kelinci: {
    down: require('@/assets/farm/pet_kelinci_down.png'),
    left: require('@/assets/farm/pet_kelinci_left.png'),
    up: require('@/assets/farm/pet_kelinci_up.png'),
    right: require('@/assets/farm/pet_kelinci_right.png'),
  },
  'kucing-oranye': {
    down: require('@/assets/farm/pet_kucing-oranye_down.png'),
    left: require('@/assets/farm/pet_kucing-oranye_left.png'),
    up: require('@/assets/farm/pet_kucing-oranye_up.png'),
    right: require('@/assets/farm/pet_kucing-oranye_right.png'),
  },
  'kucing-putih': {
    down: require('@/assets/farm/pet_kucing-putih_down.png'),
    left: require('@/assets/farm/pet_kucing-putih_left.png'),
    up: require('@/assets/farm/pet_kucing-putih_up.png'),
    right: require('@/assets/farm/pet_kucing-putih_right.png'),
  },
};
