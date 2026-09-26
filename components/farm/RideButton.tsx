import { Pressable, StyleSheet } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

import { JOYSTICK_SIZE } from './Joystick';

/** "Naik" / "Turun" pill beside the joystick for getting on and off the horse. */
export function RideButton({ bottom, riding, onPress }: { bottom: number; riding: boolean; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={riding ? 'Turun dari kuda' : 'Naik kuda'}
      style={[styles.pill, { bottom: bottom + JOYSTICK_SIZE / 2 - 22, left: space.md + JOYSTICK_SIZE + space.sm }]}>
      <Txt variant="bold">{riding ? 'Turun' : 'Naik'}</Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    pill: { ...frostOf(c), position: 'absolute', minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: space.lg },
  });
