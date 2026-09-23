import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { packStart, type Care, type PillRegimen } from '@/domain/care';
import { addDays } from '@/domain/cycle';

type Status = 'taken' | 'missed' | 'today' | 'future' | 'placebo';

function statusOf(care: Care, reg: PillRegimen, day: string, index: number, today: string): Status {
  if (index >= reg.active) return 'placebo';
  if (care.pillTaken.includes(day)) return 'taken';
  if (day === today) return 'today';
  return day < today ? 'missed' : 'future';
}

/** The current strip, one dot per pill, laid out 7 to a row like a real pack. */
export function PillPack({ care, reg, today }: { care: Care; reg: PillRegimen; today: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const first = packStart(reg, today);
  const pills = Array.from({ length: reg.active + reg.placebo }, (_, i) => {
    const day = addDays(first, i);
    return { day, index: i, status: statusOf(care, reg, day, i, today) };
  });
  return (
    <View style={styles.grid}>
      {pills.map((p) => (
        <View key={p.day} style={styles.cell} accessible accessibilityLabel={`Pil ${p.index + 1}, ${p.status}`}>
          <View style={[styles.pill, styles[p.status]]}>
            <Txt variant="caption" style={p.status === 'taken' && { color: colors.onPrimary }}>{p.index + 1}</Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm },
    cell: { width: `${100 / 7}%`, alignItems: 'center' },
    pill: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.border },
    taken: { backgroundColor: c.primary, borderColor: c.primary },
    missed: { borderColor: c.destructive },
    today: { borderColor: c.primaryDeep, backgroundColor: c.muted },
    future: { backgroundColor: c.card },
    placebo: { backgroundColor: c.muted, borderStyle: 'dashed' },
  });
