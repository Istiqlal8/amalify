import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ItemEditor } from '@/components/plan/ItemEditor';
import { CountTabs, type CountTab } from '@/components/ui/CountTabs';
import { FormDialog } from '@/components/ui/FormDialog';
import { Txt } from '@/components/ui/Txt';
import { type Palette, frostOf, radius, space } from '@/constants/theme';
import { SECTIONS, type SectionId } from '@/domain/amalan';
import { cadenceLabel, cadenceOf, isDaily } from '@/domain/cadence';
import type { ItemDraft, PlanItem } from '@/domain/plan';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { useLogs } from '@/providers/LogsProvider';

const blank = (section: SectionId): ItemDraft => ({ label: '', section, kind: 'check', target: 1, unit: '', cadence: 'harian' });

/** `null` = nothing open, `{ adding }` = new item in that section, otherwise the id being edited. */
type Editing = null | { adding: SectionId } | string;

/** Isi editor amalan pribadi tanpa pembungkus layar; dipakai di /plan dan layar gabungan. */
export function PersonalAmalanList() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { plan, addItem, updateItem, removeItem } = useLogs();
  const [section, setSection] = useState<SectionId>(SECTIONS[0].id);
  const [editing, setEditing] = useState<Editing>(null);

  const tabs = useMemo(() => sectionTabs(plan.items), [plan.items]);
  const items = plan.items.filter((it) => it.section === section);

  function openSection(id: SectionId) {
    setEditing(null); // an editor left open would belong to the section we just left
    setSection(id);
  }

  function save(draft: ItemDraft) {
    if (typeof editing === 'object' && editing) addItem(draft);
    else if (editing) updateItem(editing, draft);
    setEditing(null);
  }

  function confirmRemove(item: PlanItem) {
    Alert.alert(`Hapus "${item.label}"?`, undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeItem(item.id) },
    ]);
  }

  /** What the open dialog is editing: a blank draft when adding, otherwise the item itself. */
  const draft = typeof editing === 'object' && editing ? blank(editing.adding) : plan.items.find((it) => it.id === editing);

  return (
    <View style={styles.wrap}>
      <CountTabs options={tabs} value={section} onChange={openSection} />
      <View style={styles.section}>
        {items.map((it) => (
          <Row key={it.id} item={it} onEdit={() => setEditing(it.id)} onRemove={() => confirmRemove(it)} />
        ))}
        <Pressable accessibilityRole="button" onPress={() => setEditing({ adding: section })} style={styles.add}>
          <Txt variant="bold" style={{ color: colors.primaryDeep }}>
            + Tambah
          </Txt>
        </Pressable>
      </View>
      {draft && (
        <FormDialog onClose={() => setEditing(null)}>
          <ItemEditor initial={draft} onSave={save} onCancel={() => setEditing(null)} />
        </FormDialog>
      )}
    </View>
  );
}

function sectionTabs(items: PlanItem[]): CountTab<SectionId>[] {
  return SECTIONS.map((s) => ({ id: s.id, label: s.title, count: items.filter((it) => it.section === s.id).length }));
}

function detail(item: PlanItem): string {
  const parts = [
    isDaily(item) ? '' : cadenceLabel(cadenceOf(item)),
    item.kind === 'count' ? `${item.target} ${item.unit}`.trim() : '',
    item.reminder ? `Pengingat ${item.reminder}` : '',
  ];
  return parts.filter(Boolean).join(' · ');
}

function Row({ item, onEdit, onRemove }: { item: PlanItem; onEdit: () => void; onRemove: () => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Txt variant="bold">{item.label}</Txt>
        {detail(item) !== '' && <Txt variant="caption">{detail(item)}</Txt>}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ubah ${item.label}`} onPress={onEdit} style={styles.action}>
        <Txt variant="bold" style={{ color: colors.primaryDeep }}>Ubah</Txt>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Hapus ${item.label}`} onPress={onRemove} style={styles.action}>
        <Txt variant="bold" style={{ color: colors.destructive }}>Hapus</Txt>
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { gap: space.md },
    section: { gap: space.sm },
    flex: { flex: 1 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      minHeight: 56,
      paddingLeft: space.md,
      borderRadius: radius.md,
      ...frostOf(c),
    },
    add: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.secondary,
    },
    action: { minHeight: 44, minWidth: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm },
  });
