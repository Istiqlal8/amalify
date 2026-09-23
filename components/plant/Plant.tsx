import { useEffect, useRef } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { PlantStage } from '@/domain/plantStage';

import { PlantArt } from './PlantArt';

type Props = { stage: PlantStage; size: number; label: string };

/** Sways gently and pops when it grows a stage. Both motions are skipped under reduced motion. */
export function Plant({ stage, size, label }: Props) {
  const reduced = useReducedMotion();
  const sway = useSharedValue(0);
  const scale = useSharedValue(1);
  const previous = useRef(stage);

  useEffect(() => {
    if (reduced || stage === 0) return;
    const swing = withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) });
    const back = withTiming(-1, { duration: 1800, easing: Easing.inOut(Easing.sin) });
    sway.value = withRepeat(withSequence(swing, back), -1);
  }, [reduced, stage, sway]);

  useEffect(() => {
    const grew = stage > previous.current;
    previous.current = stage;
    if (!grew || reduced) return;
    scale.value = withSequence(withTiming(1.12, { duration: 160 }), withSpring(1, { damping: 6 }));
  }, [stage, reduced, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value * 2}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[{ transformOrigin: 'bottom' }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}>
      <PlantArt stage={stage} size={size} />
    </Animated.View>
  );
}
