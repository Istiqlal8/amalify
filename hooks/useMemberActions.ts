import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { leaveGroup, type MemberToday, removeMember, setMemberRole } from '@/services/groupService';
import { supabase } from '@/services/supabase';

type MemberActions = {
  error: string | null;
  /** Opens the admin menu for another member: promote or demote, or remove. */
  manage: (member: MemberToday) => void;
  leave: () => void;
};

export function useMemberActions(groupId: string, groupName: string, me: string | null): MemberActions {
  const [error, setError] = useState<string | null>(null);

  async function run(task: () => Promise<void>) {
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function manage(m: MemberToday) {
    const db = supabase;
    if (!db || m.userId === me) return;
    const promote = m.role === 'member';
    Alert.alert(m.name, undefined, [
      {
        text: promote ? 'Jadikan admin' : 'Jadikan anggota',
        onPress: () => run(() => setMemberRole(db, groupId, m.userId, promote ? 'admin' : 'member')),
      },
      {
        text: 'Keluarkan',
        style: 'destructive',
        onPress: () => Alert.alert(`Keluarkan ${m.name}?`, undefined, [
          { text: 'Batal', style: 'cancel' },
          { text: 'Keluarkan', style: 'destructive', onPress: () => run(() => removeMember(db, groupId, m.userId)) },
        ]),
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  }

  function leave() {
    const db = supabase;
    if (!db || !me) return;
    Alert.alert(`Keluar dari ${groupName}?`, 'Kamu perlu kode undangan untuk bergabung lagi.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => run(async () => {
          await leaveGroup(db, groupId, me);
          router.back();
        }),
      },
    ]);
  }

  return { error, manage, leave };
}
