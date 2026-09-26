import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { SURAHS } from '@/domain/tilawah';

type Props = { label: string; value: number; onChange: (surah: number) => void };

const ROWS = SURAHS.map((s, i) => ({ ...s, nomor: i + 1 }));

/** Button showing the surah; tapping opens a searchable list of all 114. */
export function SurahPicker({ label, value, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = q ? ROWS.filter((r) => r.name.toLowerCase().includes(q) || String(r.nomor) === q) : ROWS;

  function pick(nomor: number) {
    onChange(nomor);
    setOpen(false);
    setQuery('');
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${SURAHS[value - 1].name}`} onPress={() => setOpen(true)} style={styles.button}>
        <Txt variant="bold" style={{ color: colors.primaryDeep }} numberOfLines={1}>{`${value}. ${SURAHS[value - 1].name}`}</Txt>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.head}>
            <TextField label="Cari surah" value={query} onChangeText={setQuery} placeholder="Nama atau nomor" autoFocus />
          </View>
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.nomor)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable accessibilityRole="button" onPress={() => pick(item.nomor)} style={[styles.row, item.nomor === value && styles.current]}>
                <Txt variant="bold" style={styles.num}>{item.nomor}</Txt>
                <Txt style={styles.flex}>{item.name}</Txt>
                <Txt variant="caption">{`${item.ayat} ayat`}</Txt>
              </Pressable>
            )}
          />
          <View style={styles.head}>
            <ClayButton label="Tutup" tone="soft" onPress={() => setOpen(false)} />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    button: { flex: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
    sheet: { flex: 1, backgroundColor: c.background },
    head: { padding: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, paddingHorizontal: space.md },
    current: { backgroundColor: c.muted },
    num: { width: 36, color: c.primaryDeep },
    flex: { flex: 1 },
  });
