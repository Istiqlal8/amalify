import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { doneMandi, isIstihadah, maxDays, openPeriod } from '@/domain/haid';
import { useStyles } from '@/hooks/useStyles';
import { useSuciConfirm } from '@/hooks/useSuciConfirm';
import { useLogs } from '@/providers/LogsProvider';

/** Shown once haid runs past 15 days: prayer and fasting are due again. */
export function IstihadahNotice() {
  const styles = useStyles(makeStyles);
  const { haid, today } = useLogs();
  const confirmEnd = useSuciConfirm();
  const open = openPeriod(haid);
  if (!open || !isIstihadah(haid, today)) return null;
  const limit = maxDays(open);
  return (
    <View style={styles.card}>
      <Txt variant="bold">Sudah lebih dari {limit} hari</Txt>
      <Txt>
        Menurut mazhab Syafi&apos;i, darah setelah hari ke-{limit} {open.nifas ? 'nifas' : 'haid'} adalah istihadah. Sholat dan
        puasa tetap wajib; sholat sudah dihitung lagi.
      </Txt>
      <ClayButton label="Sudah suci" tone="soft" onPress={confirmEnd} />
    </View>
  );
}

/** Reminder after suci until mandi wajib is ticked off. */
export function MandiNotice() {
  const styles = useStyles(makeStyles);
  const { haid, editHaid } = useLogs();
  if (!haid.mandiDue) return null;
  return (
    <View style={styles.card}>
      <Txt variant="bold">Mandi wajib</Txt>
      <Txt>Sudah suci. Mandi wajib dulu sebelum sholat.</Txt>
      <ClayButton label="Sudah mandi" onPress={() => editHaid((h, now) => doneMandi(h, now))} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: c.muted, borderWidth: 2, borderColor: c.secondary },
  });
