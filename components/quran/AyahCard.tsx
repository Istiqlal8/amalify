import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space, frostOf } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import type { Ayah } from '@/services/quranApi';

import { NumberBadge } from './NumberBadge';

type Props = {
  ayah: Ayah;
  /** Replaces the plain Arabic line, e.g. with tajwid colours or word-by-word meanings. */
  arabic?: ReactNode;
  /** Marks the ayah whose recitation is playing. */
  active?: boolean;
  showLatin?: boolean;
  showArti?: boolean;
  children?: ReactNode;
};

function AyahCardBase({ ayah, arabic, active = false, showLatin = true, showArti = true, children }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.card, active && styles.active]}>
      <View style={styles.top}>
        <NumberBadge value={ayah.nomor} size={34} />
      </View>
      {arabic ?? <Txt style={styles.arab}>{ayah.arab}</Txt>}
      {showLatin && <Txt style={styles.latin}>{ayah.latin}</Txt>}
      {showArti && <Txt>{ayah.arti}</Txt>}
      {children}
    </View>
  );
}

export const AyahCard = memo(AyahCardBase);

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      gap: space.sm,
      padding: space.md,
      borderRadius: radius.md,
      ...frostOf(c),
    },
    active: { borderWidth: 2, borderColor: c.primary },
    top: { flexDirection: 'row' },
    arab: {
      fontFamily: fonts.arabic,
      fontSize: 28,
      lineHeight: 60,
      textAlign: 'right',
      writingDirection: 'rtl',
      color: c.foreground,
    },
    latin: { fontFamily: fonts.body, fontStyle: 'italic', color: c.primaryDeep },
  });
