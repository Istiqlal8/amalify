import { Alert, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { priceOf, type ShopItem } from '@/domain/shop';
import { useStyles } from '@/hooks/useStyles';
import type { Rewards } from '@/hooks/useRewards';

import { itemName, ShopArt } from './ShopArt';

/** One item in the shop: its art and name, then "Dipakai", "Pakai" or its price with "Beli". */
export function ShopCard({ item, rewards }: { item: ShopItem; rewards: Rewards }) {
  const styles = useStyles(makeStyles);
  const name = itemName(item);
  return (
    <View style={styles.card}>
      <View style={styles.art}>
        <ShopArt item={item} />
      </View>
      <Txt variant="bold" numberOfLines={1}>
        {name}
      </Txt>
      <ItemAction item={item} name={name} rewards={rewards} />
    </View>
  );
}

function ItemAction({ item, name, rewards }: { item: ShopItem; name: string; rewards: Rewards }) {
  const styles = useStyles(makeStyles);
  const price = priceOf(item);
  if (rewards.inUse(item)) return <Txt variant="caption" style={styles.state}>Dipakai</Txt>;
  if (rewards.owns(item)) return <ClayButton label="Pakai" tone="soft" onPress={() => rewards.use(item)} />;
  const short = price - rewards.balance;
  const confirm = () =>
    Alert.alert(`Beli ${name}?`, `${price} poin`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Beli', onPress: () => rewards.buy(item) },
    ]);
  return (
    <>
      <View style={styles.price}>
        <Txt variant="bold">{price} poin</Txt>
      </View>
      <ClayButton label={short > 0 ? `Kurang ${short} poin` : 'Beli'} onPress={confirm} disabled={short > 0} />
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), width: '47%', padding: space.md, gap: space.sm, alignItems: 'stretch' },
    art: { height: 104, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: radius.sm },
    state: { textAlign: 'center', paddingVertical: space.sm },
    price: { alignSelf: 'flex-start', backgroundColor: c.muted, borderRadius: radius.pill, paddingHorizontal: space.sm },
  });
