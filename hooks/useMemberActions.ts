import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import type { GroupRole } from '@/domain/groupRole';
import { leaveGroup, type MemberToday, removeMember, setMemberRole } from '@/services/groupService';
import { supabase } from '@/services/supabase';

type MemberActions = {
  error: string | null;
  /** The member whose role dialog is open, or null. */
  managed: MemberToday | null;
  /** Opens the admin dialog for another member. */
  manage: (member: MemberToday) => void;
  closeManage: () => void;
  setRole: (role: GroupRole) => void;
  remove: () => void;
  leave: () => void;
};

export function useMemberActions(groupId: string, groupName: string, me: string | null): MemberActions {
  const [error, setError] = useState<string | null>(null);
  const [managed, setManaged] = useState<MemberToday | null>(null);

  async function run(task: () => Promise<void>) {
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function manage(m: MemberToday) {
    if (supabase && m.userId !== me) setManaged(m);
  }

  function setRole(role: GroupRole) {
    const db = supabase;
    const m = managed;
    setManaged(null);
    if (!db || !m || m.role === role) return;
    run(() => setMemberRole(db, groupId, m.userId, role));
  }

  function remove() {
    const db = supabase;
    const m = managed;
    setManaged(null);
    if (!db || !m) return;
    Alert.alert(`Keluarkan ${m.name}?`, undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluarkan', style: 'destructive', onPress: () => run(() => removeMember(db, groupId, m.userId)) },
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

  return { error, managed, manage, closeManage: () => setManaged(null), setRole, remove, leave };
}
