import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

type Props = { initial: string | null; onSave: (message: string) => void; onClose: () => void };

/** Admin editor for the group announcement; saving an empty text removes it. */
export function AnnouncementDialog({ initial, onSave, onClose }: Props) {
  const styles = useStyles(makeStyles);
  const [text, setText] = useState(initial ?? '');

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup" />
        <Pressable style={styles.card} onPress={() => {}}>
          <TextField
            label="Pengumuman"
            value={text}
            onChangeText={setText}
            maxLength={280}
            multiline
            numberOfLines={4}
            placeholder="Kajian pekan ini pindah ke Sabtu"
            autoFocus
          />
          <ClayButton label="Simpan" disabled={text.trim().length === 0} onPress={() => onSave(text)} />
          {initial && <ClayButton label="Hapus" tone="soft" onPress={() => onSave('')} />}
          <ClayButton label="Batal" tone="soft" onPress={onClose} />
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', padding: space.md, backgroundColor: 'rgba(0,0,0,0.3)' },
    card: { ...frostOf(c), backgroundColor: c.card, borderRadius: radius.lg, padding: space.lg, gap: space.md },
  });
