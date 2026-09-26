import { useState } from 'react';
import { Alert } from 'react-native';

import { EventCard } from '@/components/event/EventCard';
import { EventForm } from '@/components/event/EventForm';
import { GroupGate } from '@/components/group/GroupGate';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { sortEvents, type EventDraft, type GroupEvent } from '@/domain/groupEvent';
import { useGroupData } from '@/hooks/useGroupData';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { addEvent, listEvents, removeEvent, setEventProgress } from '@/services/eventService';
import type { Group } from '@/services/groupService';

export default function EventScreen() {
  return (
    <StackScreen title="Event">
      <GroupGate>{(group) => <GroupEvents group={group} />}</GroupGate>
    </StackScreen>
  );
}

function GroupEvents({ group }: { group: Group }) {
  const { colors } = useTheme();
  const { today } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { data, error, run } = useGroupData(group.id, listEvents, 'group_events');
  const [adding, setAdding] = useState(false);
  const nameOf = (id: string | null) => members.find((m) => m.userId === id)?.name ?? null;

  function save(draft: EventDraft) {
    setAdding(false);
    run((db) => addEvent(db, group.id, draft));
  }

  function confirmRemove(event: GroupEvent) {
    Alert.alert(`Hapus "${event.title}"?`, undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => run((db) => removeEvent(db, event.id)) },
    ]);
  }

  return (
    <>
      {adding ? (
        <EventForm today={today} members={members} onSave={save} onCancel={() => setAdding(false)} />
      ) : (
        <ClayButton label="Tambah program" onPress={() => setAdding(true)} />
      )}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      {data.length === 0 && !adding && <Txt variant="caption">Belum ada program.</Txt>}
      {sortEvents(data, new Date()).map((e) => (
        <EventCard
          key={e.id}
          event={e}
          picName={nameOf(e.pic)}
          mine={e.createdBy === me}
          onProgress={(value) => run((db) => setEventProgress(db, e.id, value))}
          onRemove={() => confirmRemove(e)}
        />
      ))}
    </>
  );
}
