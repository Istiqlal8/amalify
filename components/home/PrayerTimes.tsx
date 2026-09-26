import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { PRAYERS, todayOf, upcomingPrayers } from '@/domain/prayer';
import { useNow } from '@/hooks/useNow';
import { useStyles } from '@/hooks/useStyles';
import { usePrayer } from '@/providers/PrayerProvider';

/** Today's five times on one frosted strip, the next one lifted. */
export function PrayerTimes() {
  const styles = useStyles(makeStyles);
  const { days } = usePrayer();
  const now = useNow();
  const today = todayOf(days, now);
  const next = upcomingPrayers(days, now)[0];
  if (!today) return null;

  return (
    <View style={styles.strip}>
      {PRAYERS.map((p) => {
        const active = next?.id === p.id && next.at.getDate() === now.getDate();
        return (
          <View key={p.id} style={[styles.slot, active && styles.active]}>
            <Txt variant="caption" numberOfLines={1} adjustsFontSizeToFit style={active && styles.strong}>{p.name}</Txt>
            <Txt style={[styles.time, active && styles.strong]}>{today[p.id]}</Txt>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    strip: { flexDirection: 'row', padding: space.xs, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.6)' },
    slot: { flex: 1, alignItems: 'center', paddingVertical: space.sm, paddingHorizontal: 2, borderRadius: radius.md },
    active: { backgroundColor: c.card, boxShadow: `0px 4px 10px ${c.shadow}` },
    time: { fontFamily: fonts.body, fontSize: 15, color: c.foreground },
    strong: { fontFamily: fonts.bodyBold, color: c.primaryDeep },
  });
