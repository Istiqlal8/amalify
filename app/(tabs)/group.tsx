import { useState } from 'react';

import { AddGroupDialog } from '@/components/group/AddGroupDialog';
import { GroupCard } from '@/components/group/GroupCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/providers/ThemeProvider';
import { useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { supabase } from '@/services/supabase';

export default function GroupScreen() {
  const { colors } = useTheme();
  const { user, groupsReady } = useAuth();
  const { today } = useLogs();
  const { list, error, create, join, refresh } = useGroups(groupsReady);
  const [adding, setAdding] = useState(false);

  if (!supabase) return <Screen title="Grup"><Txt>Grup belum dikonfigurasi.</Txt></Screen>;
  if (!user) return <Screen title="Grup"><Txt>Masuk di tab Akun untuk bergabung dengan grup.</Txt></Screen>;

  return (
    <Screen title="Grup">
      {list.map((g) => (
        <GroupCard key={g.id} group={g} today={today} initiallyOpen={list.length === 1} onChanged={refresh} />
      ))}
      <ClayButton
        label={list.length === 0 ? 'Buat atau gabung grup' : '+ Tambah grup'}
        tone={list.length === 0 ? 'primary' : 'soft'}
        onPress={() => setAdding(true)}
      />
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      {adding && <AddGroupDialog onCreate={create} onJoin={join} onClose={() => setAdding(false)} />}
    </Screen>
  );
}
