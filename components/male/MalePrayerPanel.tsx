import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { male, maleFonts, maleKicker, maleRadius } from '@/constants/male';
import { countOf } from '@/domain/dayLog';
import { cityLabel, countdown, PRAYERS, todayOf, upcomingPrayers } from '@/domain/prayer';
import { formatClock } from '@/domain/reminders';
import { useNow } from '@/hooks/useNow';
import { useLogs } from '@/providers/LogsProvider';
import { usePrayer } from '@/providers/PrayerProvider';

type Status = 'done' | 'next' | 'late' | 'upcoming';

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const STATUS_LABEL: Record<Status, string> = {
  done: 'sudah',
  next: 'berikutnya',
  late: 'belum, waktunya lewat',
  upcoming: 'belum masuk waktu',
};

/** Panel utama beranda cowok: sholat berikutnya besar + lima segmen sholat yang bisa dicentang langsung. */
export function MalePrayerPanel() {
  const { city, days, error } = usePrayer();
  const { plan, todayEntry, setToday } = useLogs();
  const now = useNow();
  const next = upcomingPrayers(days, now)[0];
  const today = todayOf(days, now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nextIsToday = next !== undefined && next.at.getDate() === now.getDate();

  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Text style={maleKicker}>{next ? 'Sholat berikutnya' : 'Jadwal sholat'}</Text>
        <Link href="/city" style={styles.city} accessibilityLabel={city ? `Kota ${cityLabel(city.name)}. Ganti kota` : 'Pilih kota'}>
          {city ? cityLabel(city.name) : 'Pilih kota'}
        </Link>
      </View>
      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
        {next ? next.name : '–'}
      </Text>
      {next && (
        <Text style={styles.when}>
          <Text style={styles.whenStrong}>{formatClock(next.at.getHours(), next.at.getMinutes())}</Text>
          {`  ·  dalam ${countdown(now, next.at)}`}
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      {today && (
        <View style={styles.segments}>
          {PRAYERS.map((p) => {
            const item = plan.items.find((it) => it.id === p.id);
            const done = item ? countOf(todayEntry, item.id) >= 1 : false;
            const passed = minutesOf(today[p.id]) <= nowMin;
            const status: Status = done ? 'done' : nextIsToday && next?.id === p.id ? 'next' : passed ? 'late' : 'upcoming';
            return (
              <Pressable
                key={p.id}
                disabled={!item}
                accessibilityRole="checkbox"
                aria-checked={done}
                accessibilityLabel={`${p.name} ${today[p.id]}, ${STATUS_LABEL[status]}`}
                accessibilityHint={item ? 'Ketuk untuk menandai' : undefined}
                onPress={() => {
                  if (!item) return;
                  Haptics.impactAsync(done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
                  setToday(item.id, done ? 0 : 1);
                }}
                style={({ pressed }) => [styles.seg, styles[status], pressed && styles.pressed]}>
                <Text style={[styles.segName, status === 'done' && styles.segNameDone]}>{p.name}</Text>
                <Text style={[styles.segTime, status === 'done' && styles.segNameDone]}>{today[p.id]}</Text>
                <View style={[styles.bar, styles[`bar_${status}`]]} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: male.panel, borderRadius: maleRadius.md, borderWidth: 1, borderColor: male.line, padding: 16, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  city: { fontFamily: maleFonts.bold, fontSize: 13, color: male.accent, paddingVertical: 12, paddingLeft: 12 },
  name: { fontFamily: maleFonts.bold, fontSize: 52, lineHeight: 58, color: male.ink, letterSpacing: -1 },
  when: { fontFamily: maleFonts.medium, fontSize: 15, lineHeight: 22, color: male.inkSoft },
  whenStrong: { fontFamily: maleFonts.bold, color: male.accent },
  error: { fontFamily: maleFonts.regular, fontSize: 13, color: male.late },
  segments: { flexDirection: 'row', gap: 6, marginTop: 16 },
  seg: { flex: 1, minHeight: 64, borderRadius: maleRadius.sm, paddingTop: 8, paddingHorizontal: 4, alignItems: 'center', gap: 2, overflow: 'hidden' },
  done: { backgroundColor: male.ok },
  next: { backgroundColor: male.panelHi, borderWidth: 1.5, borderColor: male.accent },
  late: { backgroundColor: male.panelHi },
  upcoming: { backgroundColor: male.panelHi, opacity: 0.7 },
  pressed: { opacity: 0.6 },
  segName: { fontFamily: maleFonts.bold, fontSize: 11, color: male.ink },
  segNameDone: { color: male.bg },
  segTime: { fontFamily: maleFonts.medium, fontSize: 12, color: male.inkSoft },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3 },
  bar_done: { backgroundColor: male.ok },
  bar_next: { backgroundColor: male.accent },
  bar_late: { backgroundColor: male.late },
  bar_upcoming: { backgroundColor: 'transparent' },
});
