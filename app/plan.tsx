import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemEditor } from '@/components/plan/ItemEditor';
import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { SECTIONS, type SectionId } from '@/domain/amalan';
import type { ItemDraft, PlanItem } from '@/domain/plan';
import { useLogs } from '@/providers/LogsProvider';

const blank = (section: SectionId): ItemDraft => ({ label: '', section, kind: 'check', target: 1, unit: '' });

/** `null` = nothing open, `{ adding }` = new item in that section, otherwise the id being edited. */
type Editing = null | { adding: SectionId } | string;

export default function PlanScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { plan, addItem, updateItem, removeItem } = useLogs();
  const [editing, setEditing] = useState<Editing>(null);

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

  const editor = (initial: ItemDraft) => <ItemEditor initial={initial} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Atur amalan',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryDeep,
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <Txt variant="heading" accessibilityRole="header">
              {section.title}
            </Txt>
            {plan.items
              .filter((it) => it.section === section.id)
              .map((it) =>
                editing === it.id ? (
                  <View key={it.id}>{editor(it)}</View>
                ) : (
                  <Row key={it.id} item={it} onEdit={() => setEditing(it.id)} onRemove={() => confirmRemove(it)} />
                ),
              )}
            {typeof editing === 'object' && editing?.adding === section.id ? (
              editor(blank(section.id))
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setEditing({ adding: section.id })} style={styles.add}>
                <Txt variant="bold" style={{ color: colors.primaryDeep }}>
                  + Tambah
                </Txt>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function detail(item: PlanItem): string {
  const parts = [item.kind === 'count' ? `${item.target} ${item.unit}`.trim() : '', item.reminder ? `Pengingat ${item.reminder}` : ''];
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
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: space.md, gap: space.md, paddingBottom: space.xl },
    section: { gap: space.sm },
    flex: { flex: 1 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      minHeight: 56,
      paddingLeft: space.md,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.card,
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
