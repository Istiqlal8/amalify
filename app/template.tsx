import { GroupTemplateEditor } from '@/components/group/GroupTemplateEditor';
import { StackScreen } from '@/components/ui/StackScreen';

export default function TemplateScreen() {
  return (
    <StackScreen title="Daftar amalan grup">
      <GroupTemplateEditor />
    </StackScreen>
  );
}
