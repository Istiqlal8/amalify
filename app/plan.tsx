import { PersonalAmalanList } from '@/components/plan/PersonalAmalanList';
import { StackScreen } from '@/components/ui/StackScreen';

export default function PlanScreen() {
  return (
    <StackScreen title="Atur amalan pribadi">
      <PersonalAmalanList />
    </StackScreen>
  );
}
