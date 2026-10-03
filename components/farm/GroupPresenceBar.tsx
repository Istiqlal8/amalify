import { StyleSheet, Text, View } from 'react-native';

import { farm, farmRadius } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { firstName, type Players } from '@/domain/groupFarm';

const SHOWN = 4;

type Props = { players: Players; connected: boolean };

/**
 * Who is in the garden right now, by name. The spec asks that presence never be "some animal
 * walked past": when the channel drops we say so instead of leaving the characters looking live.
 */
export function GroupPresenceBar({ players, connected }: Props) {
  const names = Object.values(players).map((p) => firstName(p.name, 8));
  const extra = names.length - SHOWN;
  const text = !connected
    ? 'Menghubungkan…'
    : names.length === 0
      ? 'Belum ada yang lain di kebun'
      : `${names.slice(0, SHOWN).join(', ')}${extra > 0 ? ` +${extra}` : ''} di kebun`;
  return (
    <View style={styles.bar} accessibilityLiveRegion="polite">
      <View style={[styles.dot, { backgroundColor: connected ? farm.foliage : farm.muted }]} />
      <Text style={styles.text} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: farmRadius.chip,
    backgroundColor: farm.paper,
    borderWidth: 1,
    borderColor: farm.paperEdge,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 12, color: farm.ink },
});
