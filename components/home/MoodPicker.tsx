import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import type { Palette } from '@/constants/theme';
import { type Mood, type MoodId, MOODS } from '@/domain/mood';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

const ICONS: Record<MoodId, SymbolViewProps['name']> = {
  senang: { ios: 'face.smiling', android: 'sentiment_very_satisfied', web: 'sentiment_very_satisfied' },
  sedih: { ios: 'cloud.rain', android: 'sentiment_sad', web: 'sentiment_sad' },
  cemas: { ios: 'tornado', android: 'sentiment_worried', web: 'sentiment_worried' },
  marah: { ios: 'flame', android: 'sentiment_extremely_dissatisfied', web: 'sentiment_extremely_dissatisfied' },
  lelah: { ios: 'battery.25percent', android: 'battery_low', web: 'battery_low' },
};

/** The question and five mood buttons. */
export function MoodPicker({ onChoose }: { onChoose: (mood: Mood) => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Txt style={styles.question}>Bagaimana suasana hatimu hari ini?</Txt>
      <View style={styles.row}>
        {MOODS.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => onChoose(m)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.mood, pressed && styles.pressed]}>
            <SymbolView name={ICONS[m.id]} tintColor={colors.primaryDeep} size={26} />
            <Txt style={styles.label}>{m.label}</Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) => {
  const k = inkOf(c);
  return StyleSheet.create({
    wrap: { gap: 12 },
    question: { fontFamily: mihrabFonts.display, fontSize: 20, lineHeight: 26, color: k.ink },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    mood: { width: '19%', minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 16 },
    pressed: { opacity: 0.5, backgroundColor: c.muted },
    label: { fontFamily: mihrabFonts.body, fontSize: 12, lineHeight: 16, color: k.ink },
  });
};
