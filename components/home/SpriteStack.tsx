import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';

type Props = { sources: ImageSourcePropType[]; visible: number; size: number };

/**
 * Every frame stays mounted and only the visible one is shown: swapping an Image's source blanks
 * it for a frame on Android, which made the character flicker as it turned or blinked.
 */
export function SpriteStack({ sources, visible, size }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      {sources.map((s, i) => (
        <Image key={i} source={s} style={[styles.layer, { width: size, height: size, opacity: i === visible ? 1 : 0 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0 },
});
