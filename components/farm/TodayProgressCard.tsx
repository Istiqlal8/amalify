import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { BAND_FILL, bandOf, farm, farmRadius, paperOf } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { plotCaption } from '@/domain/farm';
import { isTree } from '@/domain/flowers';
import { stageFromPercent, stageName } from '@/domain/plantStage';
import { useTheme } from '@/providers/ThemeProvider';

const GROW_MS = 420; // the spec's 350–500ms for a percentage change

/** Height the card takes over the scene, so the map and controls can keep clear of it. */
export const SUMMARY_SPACE = 112;

type Props = { today: string; percent: number; onHaid: boolean; recorded: boolean };

/** Fixed panel under the map: today's date, its percentage and what the plant is doing. */
export function TodayProgressCard({ today, percent, onHaid, recorded }: Props) {
  const { colors, flowerFor } = useTheme();
  const flower = flowerFor(today);
  const stage = stageFromPercent(percent);
  const [date] = plotCaption(today, percent).split(' · ');
  const width = useGrow(percent);
  const state = onHaid ? 'Hari khusus' : recorded ? `${percent}%` : 'Belum dicatat';

  return (
    <Pressable
      onPress={() => router.push('/amal-yaumi')}
      accessibilityRole="button"
      accessibilityLabel={`Hari ini ${date}, ${state}. Buka amal yaumi`}
      style={({ pressed }) => [styles.card, paperOf(), pressed && styles.pressed]}>
      <View style={styles.text}>
        <Text style={styles.label}>HARI INI · {date}</Text>
        <Text style={styles.percent}>{state}</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, width]} />
        </View>
        <Text style={styles.stage}>{onHaid ? 'Mengikuti aturan hari khusus' : stageName(stage, isTree(flower))}</Text>
      </View>
      <View style={[styles.swatch, { backgroundColor: BAND_FILL[recorded && !onHaid ? bandOf(percent) : 'kosong'] }]} />
    </Pressable>
  );
}

/** Animates the bar to the new percentage; jumps straight there under reduced motion. */
function useGrow(percent: number) {
  const reduced = useReducedMotion();
  const value = useSharedValue(percent);
  useEffect(() => {
    value.value = reduced ? percent : withTiming(percent, { duration: GROW_MS });
  }, [percent, reduced, value]);
  return useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(100, value.value))}%` }));
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: farmRadius.panel,
  },
  pressed: { opacity: 0.85 },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, color: farm.muted },
  percent: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 28, color: farm.ink },
  track: { height: 8, borderRadius: 4, backgroundColor: farm.paperSunk, overflow: 'hidden', marginTop: 2 },
  fill: { height: '100%', borderRadius: 4 },
  stage: { fontFamily: fonts.body, fontSize: 13, color: farm.muted, marginTop: 2 },
  swatch: { width: 54, height: 54, borderRadius: farmRadius.chip, borderWidth: 1, borderColor: farm.paperEdge },
});
