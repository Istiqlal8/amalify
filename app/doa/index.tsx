import type { SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { SubScreen } from '@/components/ui/SubScreen';
import { MenuTile } from '@/components/home/MenuTile';
import { space } from '@/constants/theme';
import { DOA_CATEGORIES, type DoaCategoryId } from '@/domain/doa';

const ICONS: Record<DoaCategoryId, SymbolViewProps['name']> = {
  pagi: { ios: 'sunrise.fill', android: 'wb_twilight', web: 'wb_twilight' },
  petang: { ios: 'sunset.fill', android: 'nights_stay', web: 'nights_stay' },
  sholat: { ios: 'moon.stars.fill', android: 'mosque', web: 'mosque' },
  harian: { ios: 'hands.sparkles.fill', android: 'front_hand', web: 'front_hand' },
  pilihan: { ios: 'star.fill', android: 'star', web: 'star' },
};

export default function DoaHome() {
  return (
    <SubScreen>
      <View style={styles.grid}>
        <MenuTile href="/doa/tasbih" label="Tasbih" icon={{ ios: 'circle.circle.fill', android: 'radio_button_checked', web: 'radio_button_checked' }} />
        {DOA_CATEGORIES.map((c) => (
          <MenuTile key={c.id} href={{ pathname: '/doa/[kategori]', params: { kategori: c.id } }} label={c.title} icon={ICONS[c.id]} />
        ))}
      </View>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
