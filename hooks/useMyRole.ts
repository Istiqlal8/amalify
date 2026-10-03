import * as roles from '@/domain/groupRole';
import type { MemberToday } from '@/services/groupService';

type MyRole = {
  /** Null until the members load, or when the user is not in the group. */
  role: roles.GroupRole | null;
  isAdmin: boolean;
  canManageCash: boolean;
  canManageRecords: boolean;
};

/** What the signed-in member may do in this group. */
export function useMyRole(members: MemberToday[], me: string | null): MyRole {
  const role = members.find((m) => m.userId === me)?.role ?? null;
  return {
    role,
    isAdmin: role === 'admin',
    canManageCash: roles.canManageCash(role),
    canManageRecords: roles.canManageRecords(role),
  };
}
