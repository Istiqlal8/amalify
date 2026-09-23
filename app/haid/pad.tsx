import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chips } from '@/components/haid/Chips';
import { SubScreen } from '@/components/ui/SubScreen';
import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useNow } from '@/hooks/useNow';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { careOf, lastPad, logPad, PAD_PRODUCTS, padHours, withCare, type PadProduct } from '@/domain/care';
import { dateKey } from '@/domain/dayLog';
import { formatClock } from '@/domain/reminders';
import { useLogs } from '@/providers/LogsProvider';
import { useReminders } from '@/providers/ReminderProvider';

const HOUR_MS = 3600000;
const MINUTE_MS = 60000;

function clockOf(ms: number): string {
  const d = new Date(ms);
  return formatClock(d.getHours(), d.getMinutes());
}

function untilText(dueMs: number, now: number): string {
  const minutes = Math.round((dueMs - now) / MINUTE_MS);
  if (minutes <= 0) return 'Sudah waktunya ganti';
  return `Ganti lagi pukul ${clockOf(dueMs)} (${Math.floor(minutes / 60)} j ${minutes % 60} m lagi)`;
}

export default function PadScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today, editHaid } = useLogs();
  const { requestPermission } = useReminders();
  const now = useNow().getTime();
  const care = careOf(haid);
  const last = lastPad(care);
  const [product, setProduct] = useState<PadProduct>(last?.product ?? 'pembalut');
  const changesToday = care.pads.filter((p) => dateKey(new Date(p.at)) === today).length;

  function changed() {
    requestPermission();
    editHaid((h, at) => withCare(h, logPad(careOf(h), product, at), at));
  }

  return (
    <SubScreen>
      <View style={[clayOf(colors), styles.card]}>
        <Txt variant="heading" accessibilityRole="header">Dipakai</Txt>
        <Chips options={PAD_PRODUCTS} isOn={(id) => id === product} onToggle={(id) => setProduct(id as PadProduct)} />
        <Txt variant="caption">{`Ganti tiap ${padHours(product)} jam`}</Txt>
        <ClayButton label="Baru ganti" onPress={changed} />
      </View>
      {last && (
        <View style={[clayOf(colors), styles.card]}>
          <Txt variant="bold">{`Terakhir ganti pukul ${clockOf(last.at)}`}</Txt>
          <Txt style={{ color: colors.primaryDeep }}>{untilText(last.at + padHours(last.product) * HOUR_MS, now)}</Txt>
          <Txt variant="caption">{`${changesToday} kali ganti hari ini`}</Txt>
        </View>
      )}
    </SubScreen>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
  });
