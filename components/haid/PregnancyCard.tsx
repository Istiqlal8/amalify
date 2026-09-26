import { Alert, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { daysBetween, formatDay } from '@/domain/cycle';
import { endPregnancy, startNifas } from '@/domain/haid';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** Replaces the cycle card while pregnant; forecasts and period reminders are paused. */
export function PregnancyCard({ since }: { since: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { today, editHaid } = useLogs();
  const weeks = Math.floor(daysBetween(since, today) / 7);

  function birth() {
    Alert.alert('Sudah melahirkan?', 'Masa nifas dimulai hari ini. Sholat dan puasa dijeda sampai suci, paling lama 60 hari.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Mulai nifas', onPress: () => editHaid((h, now) => startNifas(h, today, now)) },
    ]);
  }

  function stop() {
    Alert.alert('Akhiri mode hamil?', 'Perkiraan haid aktif lagi.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Akhiri', style: 'destructive', onPress: () => editHaid((h, now) => endPregnancy(h, now)) },
    ]);
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">Mode hamil</Txt>
      <Txt>
        Sejak {formatDay(since)} · {weeks} minggu tercatat
      </Txt>
      <Txt variant="caption">Perkiraan dan pengingat haid dijeda.</Txt>
      <ClayButton label="Sudah melahirkan" onPress={birth} />
      <ClayButton label="Akhiri mode hamil" tone="soft" onPress={stop} />
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm },
  });
