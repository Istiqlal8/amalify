import { GroupGate } from '@/components/group/GroupGate';
import { TemplateCard } from '@/components/group/TemplateCard';
import { StackScreen } from '@/components/ui/StackScreen';

/** One group's shared amal list, with its own plant and cadence tabs like the personal screen. */
export default function GroupAmalanScreen() {
  return (
    <StackScreen title="Amalan grup">
      {/* Keyed so switching groups resets the picked cadence tab. */}
      <GroupGate>{(group) => <TemplateCard key={group.id} group={group} />}</GroupGate>
    </StackScreen>
  );
}
