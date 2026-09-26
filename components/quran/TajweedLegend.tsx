import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { TAJWEED_RULES } from '@/domain/tajweed';

/** Colour key for the tajwid rules. */
export function TajweedLegend() {
  return (
    <View style={styles.legend}>
      {TAJWEED_RULES.map((r) => (
        <View key={r.rule} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: r.color }]} />
          <Txt variant="caption">{r.label}</Txt>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.xs },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
