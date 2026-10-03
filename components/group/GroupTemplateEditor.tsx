import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { FieldEditor } from '@/components/group/FieldEditor';
import { GroupGate } from '@/components/group/GroupGate';
import { ImportDialog } from '@/components/group/ImportDialog';
import { draftOf, fieldSummary, type FieldDraft } from '@/components/group/templateDraft';
import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { importItems } from '@/domain/groupProgress';
import { MAX_TEMPLATE_FIELDS, addField, updateField, removeField, type TemplateField } from '@/domain/groupTemplate';
import { useGroupTemplate } from '@/hooks/useGroupTemplate';
import { useMyRole } from '@/hooks/useMyRole';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useMembersToday } from '@/hooks/useGroups';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { setTemplate } from '@/services/templateService';
import { supabase } from '@/services/supabase';
import type { Group } from '@/services/groupService';

/** Converts a typed row into a stored field; the id is kept when the row already has one. */
function stored(draft: FieldDraft): Omit<TemplateField, 'id'> {
  return {
    label: draft.label,
    section: draft.section,
    kind: draft.kind,
    target: draft.kind === 'count' ? Math.max(1, Math.round(Number(draft.target) || 1)) : 1,
    unit: draft.kind === 'count' ? draft.unit.trim() : '',
    cadence: draft.cadence,
  };
}

/** Isi editor daftar amalan grup tanpa pembungkus layar; dipakai di /template dan layar gabungan. */
export function GroupTemplateEditor() {
  return <GroupGate>{(group) => <Editor group={group} />}</GroupGate>;
}

function Editor({ group }: { group: Group }) {
  const styles = useStyles(makeStyles);
  const { today, plan } = useLogs();
  const [importing, setImporting] = useState(false);
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { isAdmin } = useMyRole(members, me);
  const { template, loading } = useGroupTemplate(group.id);
  const [fields, setFields] = useState<TemplateField[] | null>(null);
  /** False when the editor is closed; otherwise the row being edited, or null when adding one. */
  const [editing, setEditing] = useState<FieldDraft | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rows = fields ?? template?.fields ?? [];
  // `isAdmin` is false while the roster loads, so wait for the member row before judging the role,
  // otherwise a member sees the editor for a moment.
  const known = members.some((m) => m.userId === me);

  if (known && !isAdmin) return <Txt>Hanya admin grup yang bisa mengubah daftar amalan.</Txt>;
  if (loading || !known) return <Txt>Memuat daftar…</Txt>;

  function edit(draft: FieldDraft) {
    const saved = stored(draft);
    setOpen(false);
    setFields(draft.id === null ? addField(rows, saved) : updateField(rows, draft.id, saved));
  }

  function confirmRemove(field: TemplateField) {
    Alert.alert(`Hapus ${field.label}?`, 'Amalan ini hilang dari layar semua anggota setelah disimpan.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setFields(removeField(rows, field.id)) },
    ]);
  }

  async function save() {
    if (!supabase) return;
    setError(null);
    try {
      await setTemplate(supabase, group.id, rows);
      setFields(null);
      Alert.alert('Tersimpan', 'Daftar grup langsung berlaku untuk semua anggota.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const changed = fields !== null;

  return (
    <View style={styles.wrap}>
      <Txt variant="caption">
        Daftar ini dipakai bersama oleh seluruh anggota dan langsung muncul di layar Amalan mereka. Kamu bisa memantau
        progres tiap anggota.
      </Txt>
      {rows.map((f) => (
        <View key={f.id} style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ubah ${f.label}`}
            onPress={() => {
              setEditing(draftOf(f));
              setOpen(true);
            }}
            style={styles.flex}>
            <Txt variant="bold" numberOfLines={1}>{f.label}</Txt>
            <Txt variant="caption">{fieldSummary(f)}</Txt>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Hapus ${f.label}`}
            hitSlop={8}
            onPress={() => confirmRemove(f)}>
            <Txt variant="caption" style={styles.error}>Hapus</Txt>
          </Pressable>
        </View>
      ))}
      {rows.length === 0 && !loading && <Txt variant="caption">Belum ada amalan. Tambahkan yang pertama.</Txt>}
      {rows.length < MAX_TEMPLATE_FIELDS && (
        <>
          <ClayButton
            label="+ Tambah amalan"
            tone="soft"
            onPress={() => {
              setEditing(null);
              setOpen(true);
            }}
          />
          <ClayButton label="Ambil dari amalan pribadi" tone="soft" onPress={() => setImporting(true)} />
        </>
      )}
      <ClayButton label="Simpan & kirim ke anggota" disabled={!changed} onPress={save} />
      {changed && <ClayButton label="Batalkan perubahan" tone="soft" onPress={() => setFields(null)} />}
      {error && <Txt style={styles.error}>{error}</Txt>}
      {open && <FieldEditor draft={editing} onSave={edit} onClose={() => setOpen(false)} />}
      {importing && (
        <ImportDialog
          items={plan.items}
          fields={rows}
          room={MAX_TEMPLATE_FIELDS - rows.length}
          onImport={(picked) => {
            setImporting(false);
            setFields(importItems(rows, picked));
          }}
          onClose={() => setImporting(false)}
        />
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { gap: space.md },
    row: { ...clayOf(c), flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
    flex: { flex: 1 },
    error: { color: c.destructive },
  });
