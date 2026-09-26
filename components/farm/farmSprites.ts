import type { ImageSourcePropType } from 'react-native';

import type { Facing } from '@/domain/farm';
import type { Animal } from '@/domain/groupFarm';
import type { HouseId, MountId } from '@/domain/estate';
import type { PetId } from '@/domain/pets';
import type { ThemeId } from '@/domain/shop';

// All farm art lives behind this file; built by scripts/build-farm-assets.py
// (CoMiGo "Farm, Puzzle & Animals" + Kenney Medieval RTS, both CC0).

export type Particles = 'petals' | 'snow' | 'fireflies' | null;

/**
 * Per garden theme: the village map tiles (yard and field blocks), the grass colour past the scene's edge, the shop preview and
 * runtime extras.
 */
export type ThemeArt = {
  /** Kebunku map tiles: the yard (middle 2×2 blocks) and field blocks, used in turn around the ring. */
  world: { yard: ImageSourcePropType; fields: ImageSourcePropType[] };
  fill: string;
  preview: ImageSourcePropType;
  particles: Particles;
  night: boolean;
  /** Winter: snowy houses and frozen ponds (no fish). */
  frozen: boolean;
};

const BASE = {
  world: { yard: require('@/assets/farm/world_yard.png'), fields: [require('@/assets/farm/world_field_trees.png'), require('@/assets/farm/world_field_roses.png'), require('@/assets/farm/world_field_bushes.png')] },
  fill: '#63A642',
};

export const THEME_ART: Record<ThemeId, ThemeArt> = {
  'musim-semi': { ...BASE, preview: require('@/assets/farm/theme_musim-semi.png'), particles: null, night: false, frozen: false },
  sakura: {
    world: { yard: require('@/assets/farm/world_yard_sakura.png'), fields: [require('@/assets/farm/world_field_trees_sakura.png'), require('@/assets/farm/world_field_roses_sakura.png'), require('@/assets/farm/world_field_bushes_sakura.png')] },
    fill: '#88AE68',
    preview: require('@/assets/farm/theme_sakura.png'),
    particles: 'petals',
    night: false,
    frozen: false,
  },
  pantai: {
    world: { yard: require('@/assets/farm/world_yard_pantai.png'), fields: [require('@/assets/farm/world_field_trees_pantai.png'), require('@/assets/farm/world_field_roses_pantai.png'), require('@/assets/farm/world_field_bushes_pantai.png')] },
    fill: '#F0DBA8',
    preview: require('@/assets/farm/theme_pantai.png'),
    particles: null,
    night: false,
    frozen: false,
  },
  salju: {
    world: { yard: require('@/assets/farm/world_yard_salju.png'), fields: [require('@/assets/farm/world_field_trees_salju.png'), require('@/assets/farm/world_field_roses_salju.png'), require('@/assets/farm/world_field_bushes_salju.png')] },
    fill: '#F0F6FC',
    preview: require('@/assets/farm/theme_salju.png'),
    particles: 'snow',
    night: false,
    frozen: true,
  },
  // Night tints the scene at runtime; the fill is the grass under the same tint.
  malam: { ...BASE, fill: '#3D6248', preview: require('@/assets/farm/theme_malam.png'), particles: 'fireflies', night: true, frozen: false },
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

/** The rideable horse per facing (composed from Kenney's Animal Pack Redux head); drawn at MOUNT_SIZE of a cell. */
export const MOUNT_SIZE = 1.35;
export const MOUNT_ART: Record<MountId, Record<Facing, ImageSourcePropType>> = {
  kuda: {
    down: require('@/assets/farm/mount_kuda_down.png'),
    left: require('@/assets/farm/mount_kuda_left.png'),
    up: require('@/assets/farm/mount_kuda_up.png'),
    right: require('@/assets/farm/mount_kuda_right.png'),
  },
};

/** House tiers on the yard: `main` sits on the 'H' footprint, `side` on 'B' (see CENTER_MAP). */
export const HOUSE_ART: Record<HouseId, { main: ImageSourcePropType; side: ImageSourcePropType }> = {
  kayu: { main: require('@/assets/farm/house_kayu_main.png'), side: require('@/assets/farm/house_kayu_side.png') },
  bata: { main: require('@/assets/farm/house_bata_main.png'), side: require('@/assets/farm/house_bata_side.png') },
  mewah: { main: require('@/assets/farm/house_mewah_main.png'), side: require('@/assets/farm/house_mewah_side.png') },
};

/** Snow-capped houses for the winter theme, and warm window light drawn over the night tint. */
export const HOUSE_SNOW: Record<HouseId, { main: ImageSourcePropType; side: ImageSourcePropType }> = {
  kayu: { main: require('@/assets/farm/house_kayu_main_salju.png'), side: require('@/assets/farm/house_kayu_side_salju.png') },
  bata: { main: require('@/assets/farm/house_bata_main_salju.png'), side: require('@/assets/farm/house_bata_side_salju.png') },
  mewah: { main: require('@/assets/farm/house_mewah_main_salju.png'), side: require('@/assets/farm/house_mewah_side_salju.png') },
};
export const HOUSE_GLOW: Record<HouseId, { main: ImageSourcePropType; side: ImageSourcePropType }> = {
  kayu: { main: require('@/assets/farm/house_kayu_main_glow.png'), side: require('@/assets/farm/house_kayu_side_glow.png') },
  bata: { main: require('@/assets/farm/house_bata_main_glow.png'), side: require('@/assets/farm/house_bata_side_glow.png') },
  mewah: { main: require('@/assets/farm/house_mewah_main_glow.png'), side: require('@/assets/farm/house_mewah_side_glow.png') },
};
