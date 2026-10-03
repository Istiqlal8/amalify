import { type ReactNode, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './Txt';

export type PickerOption<T extends string> = { id: T; label: string; hint?: string };

type Props<T extends string> = {
  title: string;
  options: PickerOption<T>[];
  value: T;
  onPick: (id: T) => void;
  onClose: () => void;
  /** Sits below the rows behind a rule, for actions that are not a choice from the list. */
  footer?: ReactNode;
};

/** Past this many rows the list no longer fits on one screen, so it gets a search box. */
const SEARCH_FROM = 8;

function matching<T extends string>(options: PickerOption<T>[], query: string): PickerOption<T>[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return options;
  return options.filter((o) => o.label.toLowerCase().includes(needle));
}

/** A modal list of choices; one full-width row each, so long names and big groups still read. */
export function PickerSheet<T extends string>({ title, options, value, onPick, onClose, footer }: Props<T>) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const searchable = options.length > SEARCH_FROM;
  const shown = useMemo(() => (searchable ? matching(options, query) : options), [searchable, options, query]);

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup" />
        <Pressable style={styles.card} onPress={() => {}}>
          <Txt variant="heading" numberOfLines={1}>{title}</Txt>
          {searchable && (
            <TextInput
              accessibilityLabel="Cari"
              placeholder="Cari"
              placeholderTextColor={colors.mutedForeground}
              style={styles.search}
              value={query}
              onChangeText={setQuery}
            />
          )}
          <FlatList
            data={shown}
            style={styles.list}
            contentContainerStyle={styles.rows}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(o) => o.id}
            ListEmptyComponent={<Txt variant="caption">Tidak ada yang cocok.</Txt>}
            renderItem={({ item }) => <PickerRow option={item} selected={item.id === value} onPress={() => onPick(item.id)} />}
          />
          {footer !== undefined && <View style={styles.footer}>{footer}</View>}
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type RowProps<T extends string> = { option: PickerOption<T>; selected: boolean; onPress: () => void };

function PickerRow<T extends string>({ option, selected, onPress }: RowProps<T>) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.row, selected && styles.selected]}>
      <Txt variant="bold" numberOfLines={1} style={selected ? { color: colors.onPrimary } : undefined}>
        {option.label}
      </Txt>
      {option.hint !== undefined && (
        <Txt variant="caption" numberOfLines={1} style={selected ? { color: colors.onPrimarySoft } : undefined}>
          {option.hint}
        </Txt>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', padding: space.lg, backgroundColor: 'rgba(0,0,0,0.55)' },
    card: { alignItems: 'stretch', gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: c.card, maxHeight: '80%' },
    search: {
      minHeight: 48,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      fontFamily: fonts.body,
      fontSize: 16,
      color: c.foreground,
    },
    // Shrinks inside the card's max height instead of pushing the footer off screen.
    list: { flexShrink: 1 },
    rows: { gap: space.sm },
    row: {
      minHeight: 44,
      justifyContent: 'center',
      paddingVertical: space.sm,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    selected: { backgroundColor: c.primaryDeep, borderColor: c.primary },
    footer: { paddingTop: space.md, borderTopWidth: 1, borderTopColor: c.border },
  });
