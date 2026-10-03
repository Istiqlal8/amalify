/** One role per member. An admin may do everything a bendahara and a sekretaris can. */
export type GroupRole = 'admin' | 'bendahara' | 'sekretaris' | 'member';

export const ROLE_LABELS: Record<GroupRole, string> = {
  admin: 'Admin',
  bendahara: 'Bendahara',
  sekretaris: 'Sekretaris',
  member: 'Anggota',
};

/** The order an admin picks from. */
export const ROLE_ORDER: GroupRole[] = ['admin', 'bendahara', 'sekretaris', 'member'];

/** The cash book and the group's dues; mirrors `can_manage_cash`. */
export function canManageCash(role: GroupRole | null): boolean {
  return role === 'admin' || role === 'bendahara';
}

/** Notes, reports and events; mirrors `can_manage_records`. */
export function canManageRecords(role: GroupRole | null): boolean {
  return role === 'admin' || role === 'sekretaris';
}
