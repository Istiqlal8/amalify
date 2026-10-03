import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BAND_FILL, farm, farmRadius, paperOf } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { plotCaption } from '@/domain/farm';
import { type DayView, dayHeadline } from '@/domain/farmDay';

import { PaperButton } from './ui/Paper';

const SHOW_MS = 2600; // the spec's brief label, long enough to read and act on

type Props = { view: DayView | null; owner?: string; bottom: number; onOpen: (view: DayView) => void };

/**
 * Replaces the permanent caption: a small card that appears when the character stops at a bed and
 * fades out by itself, with one way to open that day. Nothing floats over the world unprompted.
 */
export function BedContextCard({ view, owner, bottom, onOpen }: Props) {
  const shown = useAutoHide(view);
  if (!shown) return null;
  const [date] = plotCaption(shown.key, shown.percent).split(' · ');
  return (
    <View style={[styles.card, paperOf(), { bottom }]} accessibilityLiveRegion="polite">
      <View style={[styles.swatch, { backgroundColor: BAND_FILL[shown.band] }]} />
      <View style={styles.text}>
        <Text style={styles.date} numberOfLines={1}>
          {owner ? `${owner} · ${date}` : date}
        </Text>
        <Text style={styles.state}>{dayHeadline(shown)}</Text>
      </View>
      <PaperButton label="Lihat" onPress={() => onOpen(shown)} style={styles.action} />
    </View>
  );
}

/**
 * Keeps the last bed on screen for SHOW_MS after the character walks off it. The new bed is
 * adopted during render (React's derived-state pattern), so only the hide runs from a timer.
 */
function useAutoHide(view: DayView | null): DayView | null {
  const [shown, setShown] = useState<DayView | null>(null);
  const [seen, setSeen] = useState<DayView | null>(null);
  if (view !== seen) {
    setSeen(view);
    if (view) setShown(view);
  }
  useEffect(() => {
    if (view) return;
    const timer = setTimeout(() => setShown(null), SHOW_MS);
    return () => clearTimeout(timer);
  }, [view]);
  return shown;
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: farmRadius.panel,
  },
  swatch: { width: 34, height: 34, borderRadius: farmRadius.chip, borderWidth: 1, borderColor: farm.paperEdge },
  text: { flex: 1, gap: 1 },
  date: { fontFamily: fonts.bodyBold, fontSize: 14, color: farm.ink },
  state: { fontFamily: fonts.body, fontSize: 13, color: farm.muted },
  action: { paddingHorizontal: space.md },
});
