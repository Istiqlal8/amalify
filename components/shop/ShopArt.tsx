import { Image, StyleSheet } from 'react-native';

import { CHARACTERS, HOUSE_ART, MOUNT_ART, PET_ART, THEME_ART } from '@/components/farm/farmSprites';
import { PlantArt } from '@/components/plant/PlantArt';
import { radius } from '@/constants/theme';
import { HOUSE_NAMES, MOUNT_NAMES } from '@/domain/estate';
import { FLOWERS } from '@/domain/flowers';
import { PET_NAMES } from '@/domain/pets';
import { ANIMAL_NAMES, type ShopItem, THEME_NAMES } from '@/domain/shop';

export function itemName(item: ShopItem): string {
  if (item.kind === 'flower') return FLOWERS.find((f) => f.id === item.id)?.name ?? item.id;
  if (item.kind === 'pet') return PET_NAMES[item.id];
  if (item.kind === 'mount') return MOUNT_NAMES[item.id];
  if (item.kind === 'house') return HOUSE_NAMES[item.id];
  return item.kind === 'animal' ? ANIMAL_NAMES[item.id] : THEME_NAMES[item.id];
}

/** The flower in bloom, the animal facing us, or a preview of the garden theme. */
export function ShopArt({ item }: { item: ShopItem }) {
  if (item.kind === 'flower') return <PlantArt stage={4} size={72} flower={item.id} />;
  if (item.kind === 'animal') return <Image source={CHARACTERS[item.id].down} style={styles.animal} />;
  if (item.kind === 'pet') return <Image source={PET_ART[item.id].down} style={styles.pet} />;
  if (item.kind === 'mount') return <Image source={MOUNT_ART[item.id].right} style={styles.animal} />;
  if (item.kind === 'house') return <Image source={HOUSE_ART[item.id].main} style={styles.house} resizeMode="contain" />;
  return <Image source={THEME_ART[item.id].preview} style={styles.theme} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  animal: { width: 80, height: 80 },
  pet: { width: 64, height: 64 },
  house: { width: 96, height: 96 },
  theme: { width: '100%', height: 104, borderRadius: radius.sm },
});
