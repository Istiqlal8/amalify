import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts } from '@/constants/theme';
import { initials, RECITERS, type Reciter } from '@/domain/murottal';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { reciter: Reciter; size: number; square?: boolean };

/** The reciter's photo; initials on a tinted tile when there is none or it fails to load. */
export function ReciterAvatar({ reciter, size, square = false }: Props) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState<string | number | null>(null);
  const shades = [colors.primaryDeep, colors.primary, colors.secondary];
  const shade = shades[RECITERS.indexOf(reciter) % shades.length];
  const onShade = shade === colors.secondary ? colors.primaryDeep : colors.onPrimary;
  const shape = { width: size, height: size, borderRadius: square ? size * 0.12 : size / 2 };
  const photo = reciter.photo && failed !== reciter.photo ? reciter.photo : null;
  return (
    <View style={[styles.base, shape, { backgroundColor: shade }]}>
      {photo ? (
        <Image source={typeof photo === 'number' ? photo : { uri: photo }} style={shape} resizeMode="cover" onError={() => setFailed(photo)} />
      ) : (
        <Txt style={{ fontFamily: fonts.display, fontSize: size * 0.36, lineHeight: size * 0.46, color: onShade }}>
          {initials(reciter.name)}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
