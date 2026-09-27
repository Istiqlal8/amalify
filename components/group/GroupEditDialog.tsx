import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

type Props = {
  name: string;
  url: string | null;
  onRename: (name: string) => void;
  onChangeLogo: () => void;
  onRemoveLogo: () => void;
  onClose: () => void;
};

/** Admin editor for the group's name and logo. */
export function GroupEditDialog({ name, url, onRename, onChangeLogo, onRemoveLogo, onClose }: Props) {
  const styles = useStyles(makeStyles);
  const [draft, setDraft] = useState(name);
  const changed = draft.trim() !== '' && draft.trim() !== name;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup" />
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.preview}>
            <Avatar name={name} url={url} size={160} />
          </View>
          <ClayButton label="Ganti logo" tone="soft" onPress={onChangeLogo} />
          {url && <ClayButton label="Hapus logo" tone="soft" onPress={onRemoveLogo} />}
          <TextField label="Nama grup" value={draft} onChangeText={setDraft} maxLength={40} />
          <ClayButton label="Simpan nama" disabled={!changed} onPress={() => onRename(draft.trim())} />
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', padding: space.lg, backgroundColor: 'rgba(0,0,0,0.55)' },
    preview: { alignItems: 'center' },
    card: { alignItems: 'stretch', gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: c.card },
  });
