import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import type { Palette } from '@/constants/theme';
import { PRAYERS, todayOf, upcomingPrayers } from '@/domain/prayer';
import { useNow } from '@/hooks/useNow';
import { useStyles } from '@/hooks/useStyles';
import { usePrayer } from '@/providers/PrayerProvider';

/** Minutes past midnight of an "HH:MM" time. */
function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Today's five times as one line the sun travels along: passed ones filled, the next one ringed. */
export function PrayerTimes() {
  const styles = useStyles(makeStyles);
  const { days } = usePrayer();
  const now = useNow();
  const today = todayOf(days, now);
  const next = upcomingPrayers(days, now)[0];
  if (!today) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const passed = PRAYERS.filter((p) => minutesOf(today[p.id]) <= nowMin).length;
  // Dot centres sit at 10%, 30% … 90%; the filled stretch runs from the first to the last passed dot.
  const fill = `${Math.max(passed - 1, 0) * 20}%` as const;

  return (
    <View>
      <View style={styles.line} />
      <View style={[styles.progress, { width: fill }]} />
      <View style={styles.row}>
        {PRAYERS.map((p, i) => {
          const isNext = next?.id === p.id && next.at.getDate() === now.getDate();
          return (
            <View key={p.id} style={styles.slot}>
              <View style={[styles.dot, i < passed && styles.dotDone, isNext && styles.dotNext]} />
              <Txt style={[styles.name, isNext && styles.strong]}>{p.name}</Txt>
              <Txt style={styles.time}>{today[p.id]}</Txt>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) => {
  const k = inkOf(c);
  return StyleSheet.create({
    line: { position: 'absolute', left: '10%', right: '10%', top: 6, height: 1, backgroundColor: k.ink, opacity: 0.25 },
    progress: { position: 'absolute', left: '10%', top: 5, height: 3, backgroundColor: k.accent },
    row: { flexDirection: 'row' },
    slot: { flex: 1, gap: 6, alignItems: 'center' },
    dot: { width: 13, height: 13, borderRadius: 7, borderWidth: 1, borderColor: k.ink, backgroundColor: k.ground },
    dotDone: { backgroundColor: k.accent, borderColor: k.accent },
    dotNext: { borderColor: k.accent, borderWidth: 2 },
    name: { fontFamily: mihrabFonts.body, fontSize: 11, lineHeight: 14, color: k.inkSoft },
    time: { fontFamily: mihrabFonts.bodyBold, fontSize: 13, lineHeight: 16, color: k.ink, marginTop: -4 },
    strong: { fontFamily: mihrabFonts.bodyBold, color: k.ink },
  });
};
