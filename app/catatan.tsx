import { useState } from 'react';
import { Alert } from 'react-native';

import { GroupGate } from '@/components/group/GroupGate';
import { NoteCard } from '@/components/note/NoteCard';
import { NoteForm } from '@/components/note/NoteForm';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { useGroupData } from '@/hooks/useGroupData';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import type { Group } from '@/services/groupService';
import { addNote, listNotes, removeNote, updateNote, type GroupNote, type NoteDraft } from '@/services/noteService';

export default function NotesScreen() {
  return (
    <StackScreen title="Catatan grup">
      <GroupGate>{(group) => <GroupNotes group={group} />}</GroupGate>
    </StackScreen>
  );
}

/** `editing` is a note id, 'new' for the add form, or null when no form is open. */
function GroupNotes({ group }: { group: Group }) {
  const { colors } = useTheme();
  const { today } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { data, error, run } = useGroupData(group.id, listNotes, 'group_notes');
  const [editing, setEditing] = useState<string | null>(null);
  const nameOf = (id: string | null) => members.find((m) => m.userId === id)?.name ?? null;

  function save(draft: NoteDraft) {
    const id = editing;
    setEditing(null);
    run((db) => (id === 'new' ? addNote(db, group.id, draft) : updateNote(db, id!, draft)));
  }

  function confirmRemove(note: GroupNote) {
    Alert.alert(`Hapus "${note.title}"?`, undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => run((db) => removeNote(db, note.id)) },
    ]);
  }

  return (
    <>
      {editing === 'new' ? (
        <NoteForm onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <ClayButton label="Tulis catatan" onPress={() => setEditing('new')} />
      )}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      {data.length === 0 && editing !== 'new' && <Txt variant="caption">Belum ada catatan.</Txt>}
      {data.map((n) =>
        editing === n.id ? (
          <NoteForm key={n.id} initial={n} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <NoteCard
            key={n.id}
            note={n}
            author={nameOf(n.createdBy)}
            mine={n.createdBy === me}
            onEdit={() => setEditing(n.id)}
            onRemove={() => confirmRemove(n)}
          />
        ),
      )}
    </>
  );
}
