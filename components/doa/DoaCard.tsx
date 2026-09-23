import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { repeatCount, type Doa } from '@/domain/doa';

import { RepeatCounter } from './RepeatCounter';

function DoaCardBase({ doa }: { doa: Doa }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const repeat = repeatCount(doa.notes);

  return (
    <View style={styles.card}>
      <Txt variant="heading">{doa.title}</Txt>
      {doa.notes && (
        <View style={styles.note}>
          <Txt variant="caption" style={{ color: colors.primaryDeep }}>{doa.notes}</Txt>
        </View>
      )}
      <Txt style={styles.arab}>{doa.arabic}</Txt>
      <Txt style={styles.latin}>{doa.latin}</Txt>
      <Txt>{doa.translation}</Txt>
      {repeat > 1 && <RepeatCounter target={repeat} />}
      {doa.fawaid && (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.toggle}>
          <Txt variant="bold" style={{ color: colors.primaryDeep }}>{open ? 'Tutup keutamaan' : 'Keutamaan'}</Txt>
        </Pressable>
      )}
      {open && <Txt variant="caption">{doa.fawaid}</Txt>}
      {doa.source && <Txt variant="caption">{doa.source}</Txt>}
    </View>
  );
}

export const DoaCard = memo(DoaCardBase);

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { gap: space.sm, padding: space.md, borderRadius: radius.md, borderWidth: 2, borderColor: c.border, backgroundColor: c.card },
    note: { alignSelf: 'flex-start', paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: c.muted },
    arab: { fontFamily: fonts.arabic, fontSize: 26, lineHeight: 56, textAlign: 'right', writingDirection: 'rtl', color: c.foreground },
    latin: { fontFamily: fonts.body, fontStyle: 'italic', color: c.primaryDeep },
    toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  });
