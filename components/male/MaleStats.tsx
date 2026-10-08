import { StyleSheet, Text, View } from 'react-native';

import { male, maleFonts, maleKicker, maleRadius } from '@/constants/male';
import { streak } from '@/domain/dayLog';
import { useRewards } from '@/hooks/useRewards';
import { useLogs } from '@/providers/LogsProvider';

/** Tiga angka ringkas: streak, progres hari ini, poin. */
export function MaleStats() {
  const { logs, todayPercent, loaded } = useLogs();
  const { balance } = useRewards();
  const tiles = [
    { label: 'Streak', value: loaded ? `${streak(logs)}` : '–', unit: 'hari' },
    { label: 'Hari ini', value: loaded ? `${todayPercent}` : '–', unit: '%' },
    { label: 'Poin', value: `${balance}`, unit: '' },
  ];
  return (
    <View style={styles.row}>
      {tiles.map((t) => (
        <View key={t.label} style={styles.tile} accessible accessibilityLabel={`${t.label} ${t.value} ${t.unit}`}>
          <Text style={maleKicker}>{t.label}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {t.value}
            {t.unit ? <Text style={styles.unit}>{` ${t.unit}`}</Text> : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, backgroundColor: male.panel, borderRadius: maleRadius.md, borderWidth: 1, borderColor: male.line, padding: 12, gap: 6 },
  value: { fontFamily: maleFonts.bold, fontSize: 26, lineHeight: 30, color: male.ink },
  unit: { fontFamily: maleFonts.medium, fontSize: 13, color: male.inkSoft },
});
