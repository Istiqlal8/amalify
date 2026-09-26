import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

import { JOYSTICK_SIZE } from './Joystick';

type Props = { bottom: number; riding: boolean; onToggle: () => void; onJump: () => void };

/** Beside the joystick: "Naik" / "Turun" to get on and off the horse, and "Lompat" while riding. */
export function RideButton({ bottom, riding, onToggle, onJump }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.row, { bottom: bottom + JOYSTICK_SIZE / 2 - 22, left: space.md + JOYSTICK_SIZE + space.sm }]}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={riding ? 'Turun dari kuda' : 'Naik kuda'} style={styles.pill}>
        <Txt variant="bold">{riding ? 'Turun' : 'Naik'}</Txt>
      </Pressable>
      {riding && (
        <Pressable onPress={onJump} accessibilityRole="button" accessibilityLabel="Lompat pagar" style={styles.pill}>
          <Txt variant="bold">Lompat</Txt>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { position: 'absolute', flexDirection: 'row', gap: space.sm },
    pill: { ...frostOf(c), minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: space.lg },
  });
