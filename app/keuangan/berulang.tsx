import { useState } from 'react';

import { FinanceForm } from '@/components/keuangan/FinanceForm';
import { RecurringList } from '@/components/keuangan/RecurringList';
import { ClayButton } from '@/components/ui/ClayButton';
import { FormDialog } from '@/components/ui/FormDialog';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import type { FinanceDraft } from '@/domain/personalFinance';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { useRecurringFinance } from '@/hooks/useRecurringFinance';
import { useLogs } from '@/providers/LogsProvider';

export default function BerulangScreen() {
  const { today } = useLogs();
  const { cats, loaded, addCategory } = usePersonalFinance();
  const { rules, addRule, removeRule } = useRecurringFinance();
  const [adding, setAdding] = useState(false);

  function save(draft: FinanceDraft) {
    addRule(draft);
    setAdding(false);
  }

  return (
    <StackScreen title="Berulang">
      {loaded ? (
        <>
          <ClayButton label="Tambah berulang" onPress={() => setAdding(true)} />
          <RecurringList rules={rules} cats={cats} onRemove={removeRule} />
        </>
      ) : (
        <Txt variant="caption">Memuat…</Txt>
      )}
      {adding && (
        <FormDialog onClose={() => setAdding(false)}>
          <Txt variant="caption">Tanggal yang dipilih menjadi yang pertama, lalu tercatat sendiri di tanggal yang sama tiap bulan.</Txt>
          <FinanceForm today={today} cats={cats} onAddCategory={addCategory} onSave={save} onCancel={() => setAdding(false)} />
        </FormDialog>
      )}
    </StackScreen>
  );
}
