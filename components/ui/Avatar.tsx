import { Image, StyleSheet, View } from 'react-native';

import { type Palette } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

import { Txt } from './Txt';

type Props = { name: string; url: string | null; size?: number };

/** Profile photo, or the name's first letter when there is none. */
export function Avatar({ name, url, size = 36 }: Props) {
  const styles = useStyles(makeStyles);
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (url) return <Image source={{ uri: url }} style={[styles.base, shape]} accessibilityIgnoresInvertColors />;
  return (
    <View style={[styles.base, styles.initial, shape]}>
      <Txt variant="bold" style={{ fontSize: size * 0.42, lineHeight: size * 0.56 }}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    base: { backgroundColor: c.muted },
    initial: { alignItems: 'center', justifyContent: 'center', backgroundColor: c.secondary },
  });
