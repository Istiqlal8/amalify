import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ShopCard } from '@/components/shop/ShopCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { SHOP_ANIMALS, SHOP_FLOWERS, SHOP_PETS, SHOP_THEMES, type ShopItem } from '@/domain/shop';
import { useRewards } from '@/hooks/useRewards';

type Tab = ShopItem['kind'];

const TABS: { id: Tab; label: string }[] = [
  { id: 'flower', label: 'Bunga' },
  { id: 'animal', label: 'Karakter' },
  { id: 'theme', label: 'Tema' },
  { id: 'pet', label: 'Peliharaan' },
];
const ITEMS: Record<Tab, ShopItem[]> = { flower: SHOP_FLOWERS, animal: SHOP_ANIMALS, theme: SHOP_THEMES, pet: SHOP_PETS };

/** Toko: spend points earned from amal yaumi on flowers, characters and garden themes. */
export default function ShopScreen() {
  const rewards = useRewards();
  const { tab: initial } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initial) ? (initial as Tab) : 'flower');

  return (
    <StackScreen title="Toko">
      <View style={styles.header}>
        <Txt variant="title">{rewards.balance} poin</Txt>
        <Txt variant="caption">Dapat poin dari amal yaumi harian</Txt>
      </View>
      <PillTabs options={TABS} value={tab} onChange={setTab} />
      {tab === 'pet' && rewards.unlocks.pet !== null && <ClayButton label="Tanpa peliharaan" tone="soft" onPress={rewards.dropPet} />}
      <View style={styles.grid}>
        {ITEMS[tab].map((item) => (
          <ShopCard key={`${item.kind}-${item.id}`} item={item} rewards={rewards} />
        ))}
      </View>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
