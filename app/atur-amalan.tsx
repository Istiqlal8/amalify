import { useState } from 'react';

import { GroupTemplateEditor } from '@/components/group/GroupTemplateEditor';
import { PersonalAmalanList } from '@/components/plan/PersonalAmalanList';
import { PillTabs } from '@/components/ui/PillTabs';
import { StackScreen } from '@/components/ui/StackScreen';

type Tab = 'pribadi' | 'grup';

/** Satu menu Atur amalan: tab Pribadi untuk amalan sendiri, tab Grup untuk daftar bersama. */
export default function AturAmalanScreen() {
  const [tab, setTab] = useState<Tab>('pribadi');
  return (
    <StackScreen
      title="Atur amalan"
      header={
        <PillTabs
          options={[
            { id: 'pribadi', label: 'Pribadi' },
            { id: 'grup', label: 'Grup' },
          ]}
          value={tab}
          onChange={setTab}
        />
      }>
      {tab === 'pribadi' ? <PersonalAmalanList /> : <GroupTemplateEditor />}
    </StackScreen>
  );
}
