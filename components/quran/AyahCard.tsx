import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import type { Ayah } from '@/services/quranApi';

import { NumberBadge } from './NumberBadge';

function AyahCardBase({ ayah }: { ayah: Ayah }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <NumberBadge value={ayah.nomor} size={34} />
      </View>
      <Txt style={styles.arab}>{ayah.arab}</Txt>
      <Txt style={styles.latin}>{ayah.latin}</Txt>
      <Txt>{ayah.arti}</Txt>
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
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.card,
    },
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
