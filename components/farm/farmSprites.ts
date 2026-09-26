import type { ImageSourcePropType } from 'react-native';

import type { Facing } from '@/domain/farm';
import type { Animal } from '@/domain/groupFarm';

// All farm art lives behind this file; built by scripts/build-farm-assets.py
// (CoMiGo "Farm, Puzzle & Animals" + Kenney Medieval RTS, both CC0).

/** Static scene: grass, houses, path, fence, pond and the empty beds. */
export const SCENE = require('@/assets/farm/scene.png');
/** Same scene with the field left open, for the group farm's per-member beds. */
export const SCENE_GROUP = require('@/assets/farm/scene_group.png');
/** Plain grass colour, used beyond the scene's edges so it bleeds seamlessly. */
export const SCENE_FILL = '#63A642';

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
  pig: {
    down: require('@/assets/farm/pig_down.png'),
    left: require('@/assets/farm/pig_left.png'),
    up: require('@/assets/farm/pig_up.png'),
    right: require('@/assets/farm/pig_right.png'),
  },
  fox: {
    down: require('@/assets/farm/fox_down.png'),
    left: require('@/assets/farm/fox_left.png'),
    up: require('@/assets/farm/fox_up.png'),
    right: require('@/assets/farm/fox_right.png'),
  },
  mouse: {
    down: require('@/assets/farm/mouse_down.png'),
    left: require('@/assets/farm/mouse_left.png'),
    up: require('@/assets/farm/mouse_up.png'),
    right: require('@/assets/farm/mouse_right.png'),
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
