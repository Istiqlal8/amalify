import { ClayButton } from '@/components/ui/ClayButton';
import { PickerSheet } from '@/components/ui/PickerSheet';
import { type GroupRole, ROLE_LABELS, ROLE_ORDER } from '@/domain/groupRole';
import type { MemberToday } from '@/services/groupService';

type Props = {
  member: MemberToday;
  onSetRole: (role: GroupRole) => void;
  onRemove: () => void;
  onClose: () => void;
};

/** What each role may touch, so an admin picks by the permission and not by the title. */
const ROLE_HINTS: Record<GroupRole, string> = {
  admin: 'Semua kewenangan',
  bendahara: 'Kas dan iuran',
  sekretaris: 'Catatan, laporan dan program',
  member: 'Tanpa kewenangan tambahan',
};

const OPTIONS = ROLE_ORDER.map((r) => ({ id: r, label: ROLE_LABELS[r], hint: ROLE_HINTS[r] }));

/** Admin editor for one member: their role, or sending them out of the group. */
export function MemberRoleDialog({ member, onSetRole, onRemove, onClose }: Props) {
  return (
    <PickerSheet
      title={`Peran ${member.name}`}
      options={OPTIONS}
      value={member.role}
      onPick={onSetRole}
      onClose={onClose}
      footer={<ClayButton label="Keluarkan dari grup" tone="soft" onPress={onRemove} />}
    />
  );
}
