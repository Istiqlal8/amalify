import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';

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
import { useReceiptScan } from '@/hooks/useReceiptScan';
import { useLogs } from '@/providers/LogsProvider';


export default function TransaksiScreen() {
  const { today } = useLogs();
  const { entries, loaded, addEntry, editEntry, deleteEntry, cats, addCategory } = usePersonalFinance();
  const { month, nav } = useMonth(today.slice(0, 7));
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [scanned, setScanned] = useState<FinanceDraft | null>(null);
  const edited = entries.find((e) => e.id === editing);
  const openScanned = useCallback((draft: FinanceDraft) => {
    setScanned(draft);
    setEditing('new');
  }, []);
  const receipt = useReceiptScan(today, openScanned);
  const inMonth = useMemo(() => entriesInMonth(entries, month).sort((a, b) => (a.day < b.day ? 1 : -1)), [entries, month]);
  const visible = useMemo(() => searchEntries(inMonth, query, cats), [inMonth, query, cats]);

  function save(draft: FinanceDraft) {
    if (editing === 'new') addEntry(draft);
    else if (editing) editEntry(editing, draft);
    close();
  }

  function close() {
    setEditing(null);
    setScanned(null);
  }

  return (
    <StackScreen title="Transaksi">
      {nav}
      {loaded ? (
        <>
          <ClayButton label="Catat keuangan" onPress={() => setEditing('new')} />
          {Platform.OS !== 'web' && (
            <>
              <ClayButton label={receipt.busy ? 'Membaca nota…' : 'Foto nota'} tone="soft" disabled={receipt.busy} onPress={() => void receipt.scan('camera')} />
              <ClayButton label="Nota dari galeri" tone="soft" disabled={receipt.busy} onPress={() => void receipt.scan('gallery')} />
            </>
          )}
          {receipt.error && <Txt variant="caption">{receipt.error}</Txt>}
          <TextField label="Cari transaksi" value={query} onChangeText={setQuery} maxLength={80} placeholder="cth: nasi, bensin" />
          <FinanceList entries={visible} cats={cats} onEdit={(e: PersonalEntry) => setEditing(e.id)} onRemove={deleteEntry} />
        </>
      ) : (
        <Txt variant="caption">Memuat…</Txt>
      )}
      {editing && (
        <FormDialog onClose={close}>
          <FinanceForm key={editing} today={today} initial={edited ?? scanned ?? undefined} cats={cats} onAddCategory={addCategory} onSave={save} onCancel={close} />
        </FormDialog>
      )}
    </StackScreen>
  );
}
