import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatDay } from '@/domain/cycle';
import { dateKey } from '@/domain/dayLog';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { GroupNote } from '@/services/noteService';

type Props = { note: GroupNote; author: string | null; mine: boolean; onEdit: () => void; onRemove: () => void };

export function NoteCard({ note, author, mine, onEdit, onRemove }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">{note.title}</Txt>
      {note.body.length > 0 && <Txt selectable>{note.body}</Txt>}
      <Txt variant="caption">
        {author ?? 'Anggota'} · {formatDay(dateKey(new Date(note.updatedAt)))}
      </Txt>
      {mine && (
        <View style={styles.actions}>
          <Txt accessibilityRole="button" onPress={onEdit} style={styles.link}>
            Edit
          </Txt>
          <Txt accessibilityRole="button" onPress={onRemove} style={styles.danger}>
            Hapus
          </Txt>
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm },
    actions: { flexDirection: 'row', gap: space.lg },
    link: { color: c.primaryDeep, paddingVertical: space.xs },
    danger: { color: c.destructive, paddingVertical: space.xs },
  });
