import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { FormDialog } from '@/components/ui/FormDialog';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { cadenceLabel, cadenceOf } from '@/domain/cadence';
import { hasLabel } from '@/domain/groupProgress';
import type { TemplateField } from '@/domain/groupTemplate';
import type { PlanItem } from '@/domain/plan';
import { useStyles } from '@/hooks/useStyles';

type Props = {
  items: PlanItem[];
  /** The list being edited, so items already on it are shown as such and cannot be picked. */
  fields: TemplateField[];
  /** How many more the list can take before it reaches its cap. */
  room: number;
  onImport: (items: PlanItem[]) => void;
  onClose: () => void;
};

/** Lets an admin pick amalan from their personal list to put on the group list. */
export function ImportDialog({ items, fields, room, onImport, onClose }: Props) {
  const styles = useStyles(makeStyles);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  /** The items that can still go on the list, capped at the room left. */
  const pickable = items.filter((it) => !hasLabel(fields, it.label)).slice(0, room);
  const allPicked = pickable.length > 0 && pickable.every((it) => picked.has(it.id));
  const toggleAll = () => setPicked(allPicked ? new Set() : new Set(pickable.map((it) => it.id)));
  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < room) next.add(id);
      return next;
    });

  return (
    <FormDialog onClose={onClose}>
      <View style={styles.body}>
        <Txt variant="heading">Ambil dari amalan pribadi</Txt>
        <Txt variant="caption">Pilih amalan yang ingin dipakai bersama. Pengingat kamu tidak ikut terkirim.</Txt>
        {items.length === 0 && <Txt variant="caption">Amalan pribadi kamu masih kosong.</Txt>}
        {pickable.length > 0 && (
          <Pressable
            accessibilityRole="checkbox"
            aria-checked={allPicked}
            accessibilityLabel={allPicked ? 'Batalkan pilih semua' : `Pilih semua, ${pickable.length} amalan`}
            onPress={toggleAll}
            style={[styles.row, allPicked && styles.rowOn]}>
            <View style={[styles.box, allPicked && styles.boxOn]} />
            <View style={styles.flex}>
              <Txt variant="bold">Pilih semua</Txt>
              <Txt variant="caption">
                {pickable.length} amalan
                {pickable.length < items.filter((it) => !hasLabel(fields, it.label)).length ? ' (sisa kuota grup)' : ''}
              </Txt>
            </View>
          </Pressable>
        )}
        {items.map((it) => {
          const there = hasLabel(fields, it.label);
          const on = picked.has(it.id);
          const detail = `${cadenceLabel(cadenceOf(it))}${it.kind === 'count' ? ` · ${it.target} ${it.unit}` : ''}`;
          return (
            <Pressable
              key={it.id}
              accessibilityRole="checkbox"
              aria-checked={on}
              accessibilityState={{ disabled: there }}
              accessibilityLabel={`${it.label}, ${there ? 'sudah ada di grup' : detail}`}
              disabled={there}
              onPress={() => toggle(it.id)}
              style={[styles.row, on && styles.rowOn, there && styles.rowOff]}>
              <View style={[styles.box, on && styles.boxOn]} />
              <View style={styles.flex}>
                <Txt variant="bold" numberOfLines={1}>{it.label}</Txt>
                <Txt variant="caption">{there ? 'Sudah ada di grup' : detail}</Txt>
              </View>
            </Pressable>
          );
        })}
        {room === 0 && <Txt variant="caption">daftar grup sudah penuh.</Txt>}
        <ClayButton
          label={picked.size > 0 ? `Tambahkan ${picked.size} amalan` : 'Tambahkan'}
          disabled={picked.size === 0}
          onPress={() => onImport(items.filter((it) => picked.has(it.id)))}
        />
        <ClayButton label="Batal" tone="soft" onPress={onClose} />
      </View>
    </FormDialog>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    body: { padding: space.lg, gap: space.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      minHeight: 52,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    rowOn: { backgroundColor: c.muted, borderColor: c.primary },
    rowOff: { opacity: 0.5 },
    box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: c.secondary },
    boxOn: { backgroundColor: c.primary, borderColor: c.primaryDeep },
    flex: { flex: 1 },
  });
