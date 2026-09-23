import { useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';

import { PillTabs } from '@/components/ui/PillTabs';
import { Txt } from '@/components/ui/Txt';
import { useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/providers/AuthProvider';
import type { Group } from '@/services/groupService';
import { supabase } from '@/services/supabase';

type Props = { children: (group: Group, refreshGroups: () => Promise<void>) => ReactNode };

/** Renders `children` for the picked group (starting from a `group` route param), or says why there is none. */
export function GroupGate({ children }: Props) {
  const { user, groupsReady } = useAuth();
  const { list, refresh } = useGroups(groupsReady);
  const { group: initial } = useLocalSearchParams<{ group?: string }>();
  const [picked, setPicked] = useState<string | null>(initial ?? null);
  const group = list.find((g) => g.id === picked) ?? list[0] ?? null;

  if (!supabase) return <Txt>Grup belum dikonfigurasi.</Txt>;
  if (!user) return <Txt>Masuk di tab Akun untuk melihat grup.</Txt>;
  if (!group) return <Txt>Gabung grup dulu di tab Grup.</Txt>;
  return (
    <>
      {list.length > 1 && (
        <PillTabs options={list.map((g) => ({ id: g.id, label: g.name }))} value={group.id} onChange={setPicked} />
      )}
      {children(group, refresh)}
    </>
  );
}
