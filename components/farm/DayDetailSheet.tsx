import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { bandFillOf, farmRadius } from '@/constants/farm';
import { type Palette, fonts, space } from '@/constants/theme';
import { plotCaption } from '@/domain/farm';
import { type DayView, dayHeadline } from '@/domain/farmDay';
import { isTree } from '@/domain/flowers';
import { stageFromPercent, stageName } from '@/domain/plantStage';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { PaperBody, PaperButton, PaperTitle } from './ui/Paper';
import { PaperSheet } from './ui/PaperSheet';

type Props = { view: DayView; today: string; onClose: () => void };

/**
 * One day, opened from a calendar cell. A haid day is described as "hari khusus" with its own
 * rules; a day with no entry says so plainly. Neither is ever shown as a 0% score.
 */
export function DayDetailSheet({ view, today, onClose }: Props) {
  const { colors, flowerFor } = useTheme();
  const s = useStyles(makeStyles);
  const flower = flowerFor(view.key);
  const editable = view.key === today;
  const stage = stageFromPercent(view.percent);
  const [title] = plotCaption(view.key, view.percent).split(' · ');

  return (
    <PaperSheet onClose={onClose} height="70%" label={`Detail ${title}`}>
      <PaperTitle>{title}</PaperTitle>
      <View style={s.head}>
        <View style={[s.swatch, { backgroundColor: bandFillOf(colors)[view.band] }]} />
        <Text style={s.headline}>{dayHeadline(view)}</Text>
      </View>
      <PaperBody>{body(view, stageName(stage, isTree(flower)), editable)}</PaperBody>
      {editable && <PaperButton label="Isi amal hari ini" tone="accent" onPress={() => router.push('/amal-yaumi')} />}
    </PaperSheet>
  );
}

/** The headline already carries the status, so the body only adds what it cannot say. */
function body(view: DayView, stage: string, isToday: boolean): string {
  const when = isToday ? 'hari ini' : 'hari itu';
  if (view.status === 'nanti') return 'Tanggalnya belum tiba.';
  if (view.status === 'khusus') return 'Hari khusus mengikuti aturan amalnya sendiri, jadi tidak dihitung seperti hari biasa. Catatan ini hanya terlihat olehmu.';
  if (view.status === 'belum') return `Belum ada catatan amal untuk ${when}.`;
  return `Tanaman ${when}: ${stage}.`;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    swatch: { width: 34, height: 34, borderRadius: farmRadius.chip, borderWidth: 1, borderColor: c.border },
    headline: { fontFamily: fonts.bodyBold, fontSize: 22, color: c.foreground },
  });
