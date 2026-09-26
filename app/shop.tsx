import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ShopCard } from '@/components/shop/ShopCard';
import { ThemePicker } from '@/components/ThemePicker';
import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { SHOP_ANIMALS, SHOP_FLOWERS, SHOP_PETS, SHOP_THEMES, type ShopItem } from '@/domain/shop';
import { useFarmAudio } from '@/hooks/useFarmAudio';
import { useRewards } from '@/hooks/useRewards';

type Tab = ShopItem['kind'];

const TABS: { id: Tab; label: string }[] = [
  { id: 'flower', label: 'Bunga' },
  { id: 'animal', label: 'Karakter' },
  { id: 'theme', label: 'Tema' },
  { id: 'pet', label: 'Peliharaan' },
];
const ITEMS: Record<Tab, ShopItem[]> = { flower: SHOP_FLOWERS, animal: SHOP_ANIMALS, theme: SHOP_THEMES, pet: SHOP_PETS };

/** Toko, also the Tampilan settings page: points buy flowers, characters, themes and pets; app colours are free. */
export default function ShopScreen() {
  const rewards = useRewards();
  const { sfx } = useFarmAudio(null); // effects only, no ambience here
  const { tab: initial } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initial) ? (initial as Tab) : 'flower');

  return (
    <StackScreen title="Toko">
      <View style={styles.header}>
        <Txt variant="title">{rewards.balance} poin</Txt>
        <Txt variant="caption">Dapat poin dari amal yaumi harian</Txt>
      </View>
      <ThemePicker />
      <PillTabs options={TABS} value={tab} onChange={setTab} />
      {tab === 'pet' && rewards.unlocks.pet !== null && <ClayButton label="Tanpa peliharaan" tone="soft" onPress={rewards.dropPet} />}
      <View style={styles.grid}>
        {ITEMS[tab].map((item) => (
          <ShopCard key={`${item.kind}-${item.id}`} item={item} rewards={rewards} sfx={sfx} />
        ))}
      </View>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
