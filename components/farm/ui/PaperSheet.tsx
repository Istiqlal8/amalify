import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { farmBorder, farmRadius } from '@/constants/farm';
import { type Palette, space } from '@/constants/theme';
import { useFarmChrome } from '@/hooks/useFarmChrome';
import { useStyles } from '@/hooks/useStyles';

type Props = {
  onClose: () => void;
  children: ReactNode;
  /** Share of the screen the sheet may take; the spec's calendar wants most of it. */
  height?: '70%' | '85%';
  label?: string;
};

/** Bottom sheet on the garden panel surface, tinted from the active palette. */
export function PaperSheet({ onClose, children, height = '85%', label }: Props) {
  const chrome = useFarmChrome();
  const s = useStyles(makeStyles);
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} accessibilityViewIsModal>
      <Pressable style={s.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Tutup" />
      <SafeAreaView
        edges={['bottom']}
        style={[s.sheet, { backgroundColor: chrome.paper, borderTopColor: chrome.edge, maxHeight: height }]}
        accessibilityLabel={label}>
        <View style={s.grip} />
        {children}
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    scrim: { flex: 1, backgroundColor: c.dark ? 'rgba(0,0,0,0.55)' : 'rgba(48,44,40,0.38)' },
    sheet: {
      paddingHorizontal: space.md,
      paddingBottom: space.sm,
      gap: space.sm,
      borderTopWidth: farmBorder,
      borderTopLeftRadius: farmRadius.panel,
      borderTopRightRadius: farmRadius.panel,
    },
    grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, marginTop: space.sm },
  });
