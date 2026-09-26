import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GradientFill } from '@/components/ui/GradientFill';
import { Txt } from '@/components/ui/Txt';
import { pastels } from '@/constants/pastel';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { doaOfDay } from '@/domain/doa';
import { useStyles } from '@/hooks/useStyles';

/** A short doa that changes once a day, on a frosted card. */
export function DailyDoa() {
  const styles = useStyles(makeStyles);
  const doa = doaOfDay(new Date());

  return (
    <View style={styles.card}>
      <GradientFill from={pastels.rose.tint} to={pastels.peach.tint} />
      <View style={styles.head}>
        <Txt style={[styles.title, styles.flex]}>Doa hari ini</Txt>
        <Link href="/doa" style={styles.link}>Lainnya ›</Link>
      </View>
      <Txt variant="bold">{doa.title}</Txt>
      <Txt style={styles.arab}>{doa.arabic}</Txt>
      <Txt style={styles.translation}>{doa.translation}</Txt>
      {doa.source && <Txt variant="caption">{doa.source}</Txt>}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)' },
    head: { flexDirection: 'row', alignItems: 'center' },
    flex: { flex: 1 },
    title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: c.foreground },
    link: { fontFamily: fonts.bodyBold, fontSize: 14, color: pastels.rose.ink, minHeight: 44, textAlignVertical: 'center' },
    arab: { fontFamily: fonts.arabic, fontSize: 26, lineHeight: 52, textAlign: 'right', writingDirection: 'rtl', color: c.foreground },
    translation: { fontStyle: 'italic', color: c.foreground },
  });
