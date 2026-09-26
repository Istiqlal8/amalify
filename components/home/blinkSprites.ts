import type { ImageSourcePropType } from 'react-native';

import type { PetId } from '@/domain/pets';
import type { AnimalId } from '@/domain/shop';

/**
 * Front-facing farm sprites with the eyes closed, for the Beranda blink. Made from the farm art in
 * `assets/farm/*_down.png` by painting over the eyes and drawing a lid line.
 */
export const ANIMAL_BLINK: Record<AnimalId, ImageSourcePropType> = {
  rabbit: require('@/assets/home/blink/rabbit.png'),
  chick: require('@/assets/home/blink/chick.png'),
  cat: require('@/assets/home/blink/cat.png'),
  fox: require('@/assets/home/blink/fox.png'),
};

export const PET_BLINK: Record<PetId, ImageSourcePropType> = {
  kucing: require('@/assets/home/blink/pet_kucing.png'),
  'anak-ayam': require('@/assets/home/blink/pet_anak-ayam.png'),
  kelinci: require('@/assets/home/blink/pet_kelinci.png'),
  'kucing-oranye': require('@/assets/home/blink/pet_kucing-oranye.png'),
  'kucing-putih': require('@/assets/home/blink/pet_kucing-putih.png'),
};
