import { Alert, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { careOf, isNaturalCycle } from '@/domain/care';
import { daysBetween, formatDay } from '@/domain/cycle';
import { forecast, PHASE_LABEL, phaseOn, type Forecast } from '@/domain/cyclePhase';
import { dayOfPeriod, openPeriod } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

import { CycleRing } from './CycleRing';

type Ring = { progress: number; value: string; caption: string };

function ringFor(f: Forecast | null, today: string, haidDay: number | null): Ring | null {
  if (haidDay !== null) return { progress: haidDay / (f?.avgLength ?? 7), value: `Hari ke-${haidDay}`, caption: 'haid' };
  if (!f) return null;
  const left = daysBetween(today, f.nextStart);
  const progress = daysBetween(f.lastStart, today) / f.avgCycle;
  if (left > 0) return { progress, value: `${left} hari`, caption: 'lagi haid' };
  if (left === 0) return { progress: 1, value: 'Hari ini', caption: 'perkiraan haid' };
  return { progress: 1, value: `Telat ${-left}`, caption: 'hari' };
}

/** Countdown to the next period, or the day count while one is running. */
export function TodayCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today, todayHaid, startHaid, endHaid } = useLogs();
  const f = forecast(haid);
  const period = openPeriod(haid);
  const ring = ringFor(f, today, period ? dayOfPeriod(period, today) : null);
  const phase = f ? phaseOn(f, today, todayHaid) : null;
  const showPhase = phase && (isNaturalCycle(careOf(haid)) || phase === 'haid' || phase === 'telat');

  function confirmEnd() {
    Alert.alert('Sudah suci?', 'Sholat dihitung lagi mulai hari ini.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Sudah suci', onPress: endHaid },
    ]);
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      {ring ? <CycleRing {...ring} /> : <Txt variant="caption">Perkiraan muncul setelah 2 kali haid tercatat.</Txt>}
      {showPhase && <Txt variant="bold" style={styles.center}>{PHASE_LABEL[phase]}</Txt>}
      {f && !period && <Txt variant="caption" style={styles.center}>Perkiraan berikutnya {formatDay(f.nextStart)}</Txt>}
      {period ? (
        <ClayButton label="Sudah suci" tone="soft" onPress={confirmEnd} />
      ) : (
        <ClayButton label="Mulai haid hari ini" onPress={startHaid} />
      )}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    center: { textAlign: 'center' },
  });
