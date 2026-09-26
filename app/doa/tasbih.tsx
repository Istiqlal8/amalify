import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TasbihDial } from '@/components/tasbih/TasbihDial';
import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { Txt } from '@/components/ui/Txt';
import { clayOf, fonts, type Palette, radius, space } from '@/constants/theme';
import { START, TASBIH_PRESETS, tap } from '@/domain/tasbih';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

const HAPTIC = {
  count: () => Haptics.selectionAsync(),
  phraseDone: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  finished: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

/** Digital tasbih: tap the dial to count; set presets move through their phrases on their own. */
export default function TasbihScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [presetId, setPresetId] = useState(TASBIH_PRESETS[0].id);
  const [state, setState] = useState(START);
  const preset = TASBIH_PRESETS.find((p) => p.id === presetId) ?? TASBIH_PRESETS[0];
  const phrase = preset.phrases[state.phrase];

  function onTap() {
    const result = tap(preset, state);
    if (result.state !== state) setState(result.state);
    HAPTIC[result.event]();
  }

  function choose(id: string) {
    setPresetId(id);
    setState(START);
  }

  return (
    <View style={styles.root}>
      <SoftBackdrop />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View>
          <PillTabs options={TASBIH_PRESETS} value={presetId} onChange={choose} />
        </View>
        <View style={[clayOf(colors), styles.phrase]}>
          <Txt style={styles.arab}>{phrase.arabic}</Txt>
          <Txt variant="bold">{phrase.latin}</Txt>
          <Txt variant="caption">{phrase.arti}</Txt>
        </View>
        <TasbihDial count={state.count} target={phrase.target} finished={state.finished} onTap={onTap} />
        {preset.phrases.length > 1 && (
          <View style={styles.steps}>
            {preset.phrases.map((p, i) => (
              <View key={p.latin} style={[styles.step, i < state.phrase || state.finished ? styles.stepDone : i === state.phrase && styles.stepNow]} />
            ))}
          </View>
        )}
        <ClayButton label="Ulangi" tone="soft" onPress={() => setState(START)} />
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.card },
    safe: { flex: 1, padding: space.md, gap: space.lg, justifyContent: 'space-between' },
    phrase: { alignItems: 'center', gap: space.xs, padding: space.lg },
    arab: { fontFamily: fonts.arabic, fontSize: 32, lineHeight: 64, color: c.foreground, textAlign: 'center' },
    steps: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
    step: { width: 28, height: 8, borderRadius: radius.pill, backgroundColor: c.muted },
    stepNow: { backgroundColor: c.secondary },
    stepDone: { backgroundColor: c.primary },
  });
