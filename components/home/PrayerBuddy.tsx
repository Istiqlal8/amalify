import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { CHARACTERS, PET_ART } from '@/components/farm/farmSprites';
import type { Facing } from '@/domain/farm';
import { PET_NAMES } from '@/domain/pets';
import { ANIMAL_NAMES } from '@/domain/shop';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { ANIMAL_BLINK, PET_BLINK } from './blinkSprites';
import { useBlink, useBodyStyle, useBreath, useCheer, useGlance } from './buddyMotion';
import { SpriteStack } from './SpriteStack';

const SIZE = 136;
const PET_SIZE = 70;
// Frame order in each stack: the four facings, then the front view with eyes closed.
const FACINGS: Facing[] = ['down', 'left', 'up', 'right'];
const BLINK_FRAME = FACINGS.length;

/** The user's farm character and pet, breathing, glancing and blinking; a tap makes them jump. */
export function PrayerBuddy() {
  const { unlocks } = useLogs();
  const { colors } = useTheme();
  const face = useGlance();
  const blink = useBlink();
  const petBlink = useBlink();
  const { jump, petJump, heartStyle, cheer } = useCheer();
  const body = useBodyStyle(useBreath(0), jump, 8);
  const petBody = useBodyStyle(useBreath(350), petJump, 4);
  const { animal, pet } = unlocks;
  const name = pet ? `${ANIMAL_NAMES[animal]} dan ${PET_NAMES[pet]}` : ANIMAL_NAMES[animal];

  return (
    <Pressable onPress={cheer} accessibilityRole="button" accessibilityLabel={`${name}. Ketuk untuk menyapa`} style={styles.stage}>
      <Animated.View style={[styles.heart, heartStyle]} pointerEvents="none">
        <SymbolView name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }} tintColor={colors.primary} size={28} />
      </Animated.View>
      <Animated.View style={body}>
        <SpriteStack
          sources={[...FACINGS.map((f) => CHARACTERS[animal][f]), ANIMAL_BLINK[animal]]}
          visible={blink && face === 'down' ? BLINK_FRAME : FACINGS.indexOf(face)}
          size={SIZE}
        />
      </Animated.View>
      {pet && (
        <Animated.View style={[styles.petSlot, petBody]}>
          <SpriteStack sources={[PET_ART[pet].down, PET_BLINK[pet]]} visible={petBlink ? 1 : 0} size={PET_SIZE} />
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: { width: 156, height: 160, justifyContent: 'flex-end', alignItems: 'flex-start', marginLeft: -12 },
  petSlot: { position: 'absolute', right: -10, bottom: 0 },
  heart: { position: 'absolute', left: SIZE / 2 - 14, top: 0 },
});
