import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

import { TapPad } from './gesture';
import { JOYSTICK_SIZE } from './Joystick';

type Props = { bottom: number; riding: boolean; onToggle: () => void; onJump: () => void };

/** Beside the joystick: "Naik" / "Turun" to get on and off the horse, and "Lompat" while riding. */
export function RideButton({ bottom, riding, onToggle, onJump }: Props) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { bottom: bottom + JOYSTICK_SIZE / 2 - 22, left: insets.left + space.md + JOYSTICK_SIZE + space.sm }]}>
      <RidePill label={riding ? 'Turun' : 'Naik'} a11y={riding ? 'Turun dari kuda' : 'Naik kuda'} onPress={onToggle} />
      {riding && <RidePill label="Lompat" a11y="Lompat pagar" onPress={onJump} />}
    </View>
  );
}

/**
 * A tap pad rather than a plain Pressable: when the native gesture handler is available the
 * joystick and these buttons each own their recogniser, so a second finger can steer while these
 * are tapped. On builds without it, `TapPad` falls back to a Pressable.
 */
function RidePill({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <TapPad accessibilityLabel={a11y} onPress={onPress} style={styles.pill}>
      <Txt variant="bold">{label}</Txt>
    </TapPad>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { position: 'absolute', flexDirection: 'row', gap: space.sm },
    pill: { ...frostOf(c), minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: space.lg },
  });
