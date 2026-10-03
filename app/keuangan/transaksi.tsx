import { useMemo, useState } from 'react';

import { FinanceForm } from '@/components/keuangan/FinanceForm';
import { FinanceList } from '@/components/keuangan/FinanceList';
import { useMonth } from '@/components/keuangan/month';
import { ClayButton } from '@/components/ui/ClayButton';
import { FormDialog } from '@/components/ui/FormDialog';
import { StackScreen } from '@/components/ui/StackScreen';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { entriesInMonth, searchEntries, type FinanceDraft, type PersonalEntry } from '@/domain/personalFinance';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { useLogs } from '@/providers/LogsProvider';


export default function TransaksiScreen() {
  const { today } = useLogs();
  const { entries, loaded, addEntry, editEntry, deleteEntry, cats, addCategory } = usePersonalFinance();
  const { month, nav } = useMonth(today.slice(0, 7));
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const edited = entries.find((e) => e.id === editing);
  const inMonth = useMemo(() => entriesInMonth(entries, month).sort((a, b) => (a.day < b.day ? 1 : -1)), [entries, month]);
  const visible = useMemo(() => searchEntries(inMonth, query, cats), [inMonth, query, cats]);

  function save(draft: FinanceDraft) {
    if (editing === 'new') addEntry(draft);
    else if (editing) editEntry(editing, draft);
    setEditing(null);
  }

  return (
    <StackScreen title="Transaksi">
      {nav}
      {loaded ? (
        <>
          <ClayButton label="Catat keuangan" onPress={() => setEditing('new')} />
          <TextField label="Cari transaksi" value={query} onChangeText={setQuery} maxLength={80} placeholder="cth: nasi, bensin" />
          <FinanceList entries={visible} cats={cats} onEdit={(e: PersonalEntry) => setEditing(e.id)} onRemove={deleteEntry} />
        </>
      ) : (
        <Txt variant="caption">Memuat…</Txt>
      )}
      {editing && (
        <FormDialog onClose={() => setEditing(null)}>
          <FinanceForm key={editing} today={today} initial={edited} cats={cats} onAddCategory={addCategory} onSave={save} onCancel={() => setEditing(null)} />
        </FormDialog>
      )}
    </StackScreen>
  );
}
