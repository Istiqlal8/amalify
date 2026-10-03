import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

type Props = { children: ReactNode; onClose: () => void };

/**
 * Puts a form in front of the screen instead of growing it at the bottom of a list, where a new
 * entry opened below the last row and off the screen. It scrolls because most of these forms are
 * taller than a phone once the keyboard is up, and it sits on a solid card: the forms use the
 * translucent clay style, which lets the list show through over a dimmed backdrop.
 */
export function FormDialog({ children, onClose }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.card} onPress={() => {}}>
            {children}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
    scroll: { flexGrow: 0, maxHeight: '90%' },
    body: { padding: space.lg },
    card: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.card },
  });
