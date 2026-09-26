import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { NoteDraft } from '@/services/noteService';

type Props = { initial?: NoteDraft; onSave: (draft: NoteDraft) => void; onCancel: () => void };

export function NoteForm({ initial, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');

  return (
    <View style={[clayOf(colors), styles.card]}>
      <TextField label="Judul" value={title} onChangeText={setTitle} maxLength={80} placeholder="Materi halaqoh pekan ini" />
      <TextField
        label="Isi"
        value={body}
        onChangeText={setBody}
        maxLength={5000}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      <ClayButton label="Simpan" disabled={!title.trim()} onPress={() => onSave({ title: title.trim(), body: body.trim() })} />
      <ClayButton label="Batal" tone="soft" onPress={onCancel} />
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
  });
