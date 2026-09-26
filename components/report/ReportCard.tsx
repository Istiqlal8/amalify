import { SymbolView } from 'expo-symbols';
import { Share, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { entryText, reportDate, reportShareText, type GroupReport } from '@/domain/groupReport';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { report: GroupReport; groupName: string; author: string | null; mine: boolean; onEdit: () => void; onRemove: () => void };

/** A meeting's report: date band, numbers as stat tiles, text answers underneath. */
export function ReportCard({ report, groupName, author, mine, onEdit, onRemove }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const filled = report.entries.filter((e) => e.value.trim());
  const stats = filled.filter((e) => e.kind === 'number');
  const texts = filled.filter((e) => e.kind !== 'number');

  return (
    <View style={[clayOf(colors), styles.card]}>
      <View style={[styles.band, { backgroundColor: colors.muted }]}>
        <Txt variant="heading">{reportDate(report.day)}</Txt>
        <View style={styles.meta}>
          <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} tintColor={colors.primaryDeep} size={16} />
          <Txt variant="caption">{report.time}</Txt>
          {report.location.length > 0 && (
            <>
              <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} tintColor={colors.primaryDeep} size={16} />
              <Txt variant="caption" numberOfLines={1} style={styles.flex}>
                {report.location}
              </Txt>
            </>
          )}
        </View>
      </View>
      {stats.length > 0 && (
        <View style={styles.stats}>
          {stats.map((e) => (
            <View key={e.label} style={[styles.stat, { borderColor: colors.border }]}>
              <Txt variant="heading">{e.value}</Txt>
              <Txt variant="caption" numberOfLines={2} style={styles.center}>
                {e.unit ? `${e.unit} ${e.label.toLowerCase()}` : e.label}
              </Txt>
            </View>
          ))}
        </View>
      )}
      {texts.map((e) => (
        <View key={e.label} style={styles.text}>
          <Txt variant="bold">{e.label}</Txt>
          <Txt selectable>{entryText(e)}</Txt>
        </View>
      ))}
      <View style={styles.footer}>
        <Txt variant="caption" style={styles.flex}>
          {author ?? 'Anggota'}
        </Txt>
        <Txt accessibilityRole="button" style={styles.link} onPress={() => Share.share({ message: reportShareText(report, groupName) })}>
          Bagikan
        </Txt>
        {mine && (
          <>
            <Txt accessibilityRole="button" style={styles.link} onPress={onEdit}>
              Edit
            </Txt>
            <Txt accessibilityRole="button" style={styles.danger} onPress={onRemove}>
              Hapus
            </Txt>
          </>
        )}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.sm, gap: space.md },
    band: { padding: space.md, borderRadius: radius.md, gap: space.xs },
    meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
    flex: { flex: 1 },
    stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.sm },
    stat: { minWidth: 96, flexGrow: 1, alignItems: 'center', padding: space.sm, borderRadius: radius.md, borderWidth: 1 },
    center: { textAlign: 'center' },
    text: { gap: 2, paddingHorizontal: space.sm },
    footer: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.sm, paddingBottom: space.xs },
    link: { color: c.primaryDeep, paddingVertical: space.xs },
    danger: { color: c.destructive, paddingVertical: space.xs },
  });
