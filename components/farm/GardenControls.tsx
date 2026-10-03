import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { farm, touch } from '@/constants/farm';
import { space } from '@/constants/theme';

import type { StageMode } from './FarmStage';
import { JOYSTICK_SIZE } from './Joystick';
import { PaperButton } from './ui/Paper';

const ICON = {
  explore: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
  back: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  soundOn: { ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' },
  soundOff: { ios: 'speaker.slash.fill', android: 'volume_off', web: 'volume_off' },
} as const;

const icon = (name: SymbolViewProps['name']) => <SymbolView name={name} tintColor={farm.ink} size={20} />;

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
  if (mode === 'overview') {
    return (
      <View style={[styles.row, { bottom: bottom + space.sm }]}>
        <PaperButton label="Jelajah" icon={icon(ICON.explore)} onPress={() => onMode('jelajah')} />
        <PaperButton label="Kalender" icon={icon(ICON.calendar)} onPress={onCalendar} />
      </View>
    );
  }
  return (
    <View style={[styles.row, { top: top + space.sm }]}>
      <PaperButton label="Peta" icon={icon(ICON.back)} onPress={() => onMode('overview')} accessibilityLabel="Kembali ke peta kebun" />
      <PaperButton
        label=""
        icon={icon(soundOn ? ICON.soundOn : ICON.soundOff)}
        onPress={onSound}
        accessibilityLabel={soundOn ? 'Matikan suara kebun' : 'Nyalakan suara kebun'}
        style={styles.iconOnly}
      />
    </View>
  );
}

/** Space the joystick and its neighbours occupy, so the scene can keep clear of them. */
export const CONTROL_SPACE = JOYSTICK_SIZE + space.md;

const styles = StyleSheet.create({
  row: { position: 'absolute', left: space.md, flexDirection: 'row', gap: space.sm },
  iconOnly: { width: touch.min, paddingHorizontal: 0 },
});
