import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { SCENES, type Scene } from './scenes';

type Props = { visible: boolean; value: Scene; onPick: (id: string) => void; onClose: () => void };

/** Bottom sheet listing the player backdrops. */
export function ScenePicker({ visible, value, onPick, onClose }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Tutup" />
      <View style={[styles.sheet, { paddingBottom: bottom + space.md }]}>
        <Txt variant="heading">Latar</Txt>
        {SCENES.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => {
              onPick(s.id);
              onClose();
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: s.id === value.id }}
            style={styles.row}>
            <Txt variant="bold" style={styles.flex}>{s.label}</Txt>
            {s.id === value.id && (
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={colors.primary} size={22} />
            )}
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    scrim: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
    sheet: {
      backgroundColor: c.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      padding: space.lg,
      gap: space.xs,
    },
    row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: space.md },
    flex: { flex: 1 },
  });
