import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FarmScene } from '@/components/farm/FarmScene';
import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { lastDays, pastPercent, streak } from '@/domain/dayLog';
import { buildFarm } from '@/domain/farm';
import { isHaidDay, itemsForDay } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

const DAYS = 28;

export default function GardenScreen() {
  const styles = useStyles(makeStyles);
  const top = useSafeAreaInsets().top;
  const { logs, plan, haid, today, todayPercent } = useLogs();
  const days = lastDays(DAYS).map((key) => {
    const onHaid = isHaidDay(haid, key);
    const percent = key === today ? todayPercent : pastPercent(logs[key], itemsForDay(plan.items, onHaid));
    return { key, percent, onHaid };
  });
  const plots = buildFarm(days);
  const blooms = plots.filter((p) => p.stage === 4).length;

  return (
    <View style={styles.root}>
      <FarmScene plots={plots} />
      <View style={[styles.header, { top: top + space.sm }]}>
        <View style={styles.pill}>
          <Txt variant="heading" accessibilityRole="header">
            Kebunku
          </Txt>
        </View>
        <Chip value={streak(logs)} label="hari beruntun" />
        <Chip value={blooms} label="berbunga" />
      </View>
    </View>
  );
}

function Chip({ value, label }: { value: number; label: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.pill, styles.chip]} accessible accessibilityLabel={`${value} ${label}`}>
      <Txt variant="bold">{value}</Txt>
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: { position: 'absolute', left: space.md, right: space.md, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
    pill: { ...frostOf(c), borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
    chip: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  });
