import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import { fonts, type Palette } from '@/constants/theme';
import { doaOfDay } from '@/domain/doa';
import { useStyles } from '@/hooks/useStyles';

/** A short doa that changes once a day, set like a quotation below a rule. */
export function DailyDoa() {
  const styles = useStyles(makeStyles);
  const doa = doaOfDay(new Date());

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Txt style={styles.kicker}>Doa hari ini</Txt>
        <Link href="/doa" style={styles.link}>Lainnya ›</Link>
      </View>
      <Txt style={styles.title}>{doa.title}</Txt>
      <Txt style={styles.arab}>{doa.arabic}</Txt>
      <Txt style={styles.translation}>{`“${doa.translation}”`}</Txt>
      {doa.source && <Txt style={styles.kicker}>{doa.source}</Txt>}
    </View>
  );
}

const makeStyles = (c: Palette) => {
  const k = inkOf(c);
  return StyleSheet.create({
    wrap: { borderTopWidth: 1, borderTopColor: k.rule, paddingTop: 8, gap: 8 },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    kicker: { fontFamily: mihrabFonts.bodyMedium, fontSize: 11, lineHeight: 16, letterSpacing: 1.6, textTransform: 'uppercase', color: k.inkSoft },
    link: { fontFamily: mihrabFonts.bodyBold, fontSize: 13, minHeight: 44, textAlignVertical: 'center', color: k.accent },
    title: { fontFamily: mihrabFonts.bodyBold, fontSize: 15, lineHeight: 21, color: k.ink },
    arab: { fontFamily: fonts.arabic, fontSize: 26, lineHeight: 52, textAlign: 'right', writingDirection: 'rtl', color: k.ink },
    translation: { fontFamily: mihrabFonts.displayItalic, fontSize: 17, lineHeight: 25, color: k.ink },
  });
};
