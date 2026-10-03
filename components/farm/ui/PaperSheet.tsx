import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { farm, farmBorder, farmRadius } from '@/constants/farm';
import { space } from '@/constants/theme';

type Props = {
  onClose: () => void;
  children: ReactNode;
  /** Share of the screen the sheet may take; the spec's calendar wants most of it. */
  height?: '70%' | '85%';
  label?: string;
};

/** Bottom sheet on warm paper: the garden's panel surface, not the app's white card. */
export function PaperSheet({ onClose, children, height = '85%', label }: Props) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} accessibilityViewIsModal>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Tutup" />
      <SafeAreaView edges={['bottom']} style={[styles.sheet, { maxHeight: height }]} accessibilityLabel={label}>
        <View style={styles.grip} />
        {children}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(48,44,40,0.38)' },
  sheet: {
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    gap: space.sm,
    backgroundColor: farm.paper,
    borderTopWidth: farmBorder,
    borderColor: farm.paperEdge,
    borderTopLeftRadius: farmRadius.panel,
    borderTopRightRadius: farmRadius.panel,
  },
  grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: farm.paperEdge, marginTop: space.sm },
});
