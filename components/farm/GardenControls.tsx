import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { touch } from '@/constants/farm';
import { space } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

import type { StageMode } from './FarmStage';
import { PaperButton } from './ui/Paper';

const ICON = {
  explore: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
  back: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  soundOn: { ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' },
  soundOff: { ios: 'speaker.slash.fill', android: 'volume_off', web: 'volume_off' },
} as const;

const icon = (name: SymbolViewProps['name'], color: string) => <SymbolView name={name} tintColor={color} size={20} />;

type Props = {
  mode: StageMode;
  top: number;
  bottom: number;
  soundOn: boolean;
  onMode: (mode: StageMode) => void;
  onCalendar: () => void;
  onSound: () => void;
};

/**
 * Only the controls the current mode needs. Overview offers Jelajah and the calendar; Jelajah
 * offers the way back and the sound toggle — never both sets at once, which is what crowded
 * the bottom third of the old screen.
 */
export function GardenControls({ mode, top, bottom, soundOn, onMode, onCalendar, onSound }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const ink = colors.foreground;
  const left = insets.left + space.md;
  if (mode === 'overview') {
    return (
      <View style={[styles.row, { left, bottom: bottom + space.sm }]}>
        <PaperButton label="Jelajah" icon={icon(ICON.explore, ink)} onPress={() => onMode('jelajah')} />
        <PaperButton label="Kalender" icon={icon(ICON.calendar, ink)} onPress={onCalendar} />
      </View>
    );
  }
  return (
    <View style={[styles.row, { left, top: top + space.sm }]}>
      <PaperButton label="Peta" icon={icon(ICON.back, ink)} onPress={() => onMode('overview')} accessibilityLabel="Kembali ke peta kebun" />
      <PaperButton
        label=""
        icon={icon(soundOn ? ICON.soundOn : ICON.soundOff, ink)}
        onPress={onSound}
        accessibilityLabel={soundOn ? 'Matikan suara kebun' : 'Nyalakan suara kebun'}
        style={styles.iconOnly}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { position: 'absolute', flexDirection: 'row', gap: space.sm },
  iconOnly: { width: touch.min, paddingHorizontal: 0 },
});
