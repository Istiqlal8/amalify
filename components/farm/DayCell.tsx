import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { bandFillOf, bandInkOf, farmRadius, touch } from '@/constants/farm';
import { type Palette, fonts, space } from '@/constants/theme';
import { type DayView, STATUS_GLYPH, STATUS_LABEL } from '@/domain/farmDay';
import { plotCaption } from '@/domain/farm';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { view: DayView; day: number; isToday: boolean; accent: string; onPress: () => void };

/**
 * One day in the month calendar. Status is carried three ways — fill, glyph and (for today) a
 * label — so nothing depends on colour alone. A day nobody logged reads "belum dicatat", never 0%.
 */
export const DayCell = memo(function DayCell({ view, day, isToday, accent, onPress }: Props) {
  const { colors } = useTheme();
  const s = useStyles(makeStyles);
  const fill = bandFillOf(colors)[view.band];
  const ink = bandInkOf(colors)[view.band];
  const future = view.status === 'nanti';
  return (
    <Pressable
      onPress={onPress}
      disabled={future}
      accessibilityRole="button"
      accessibilityState={{ disabled: future, selected: isToday }}
      accessibilityLabel={label(view, isToday)}
      style={({ pressed }) => [
        s.cell,
        { backgroundColor: fill },
        future && s.future,
        isToday && { borderColor: accent, borderWidth: 2.5 },
        pressed && s.pressed,
      ]}>
      <Text style={[s.day, { color: ink }]}>{day}</Text>
      <Text style={[s.glyph, { color: ink }]}>{STATUS_GLYPH[view.status]}</Text>
      {view.status === 'tercatat' && view.band === 'penuh' && <Text style={s.bloom}>✿</Text>}
      {view.onHaid && <View style={[s.marker, { backgroundColor: accent }]} />}
      {isToday && <Text style={[s.today, { color: accent }]}>Hari ini</Text>}
    </Pressable>
  );
});

function label(view: DayView, isToday: boolean): string {
  const head = `${plotCaption(view.key, view.percent).split(' · ')[0]}`;
  const state = view.status === 'tercatat' ? `${view.percent}%` : STATUS_LABEL[view.status];
  return `${head}, ${state}${view.onHaid ? ', hari khusus' : ''}${isToday ? ', hari ini' : ''}`;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    cell: {
      flex: 1,
      minWidth: touch.cell.width,
      minHeight: touch.cell.height + 12,
      borderRadius: farmRadius.chip,
      borderWidth: 1,
      borderColor: c.border,
      paddingTop: 2,
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 1,
    },
    future: { opacity: 0.45 },
    pressed: { opacity: 0.75 },
    day: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 15 },
    glyph: { fontFamily: fonts.body, fontSize: 13, lineHeight: 15 },
    bloom: { position: 'absolute', right: 3, bottom: 2, fontSize: 10, color: c.primary },
    marker: { position: 'absolute', left: 3, bottom: 4, width: 6, height: 6, borderRadius: 3 },
    today: { fontFamily: fonts.bodyBold, fontSize: 8, lineHeight: 10, marginTop: space.xs / 2 },
  });
