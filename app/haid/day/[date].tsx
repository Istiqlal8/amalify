import { Stack, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Chips } from '@/components/haid/Chips';
import { PeriodForm } from '@/components/haid/PeriodForm';
import { SubScreen } from '@/components/ui/SubScreen';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { formatDay } from '@/domain/cycle';
import { containingPeriod, isHaidDay } from '@/domain/haid';
import { customSymptoms, FLOWS, noteOf, PAINS, setDayNote, SYMPTOMS, toggleSymptom, type DayNote, type Flow } from '@/domain/haidDay';
import { useLogs } from '@/providers/LogsProvider';

const PAIN_OPTIONS = PAINS.map((label, i) => ({ id: String(i), label }));

export default function DayNoteScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { haid, editHaid, removeHaid } = useLogs();
  const [custom, setCustom] = useState('');
  const [editingPeriod, setEditingPeriod] = useState(false);
  const note = noteOf(haid, date);
  const symptoms = [...SYMPTOMS, ...customSymptoms(haid)].map((s) => ({ id: s, label: s }));
  const period = containingPeriod(haid, date);
  const save = (next: DayNote) => editHaid((h, now) => setDayNote(h, date, next, now));

  function confirmRemovePeriod() {
    if (!period) return;
    Alert.alert(`Hapus masa ${formatDay(period.start)}?`, 'Hari-harinya dihitung lagi seperti biasa.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeHaid(period.start) },
    ]);
  }

  function addCustom() {
    const name = custom.trim();
    if (name && !note.symptoms.includes(name)) save({ ...note, symptoms: [...note.symptoms, name] });
    setCustom('');
  }

  return (
    <SubScreen>
      <Stack.Screen options={{ title: formatDay(date) }} />
      {isHaidDay(haid, date) && <Txt variant="bold" style={{ color: colors.primaryDeep }}>Hari haid</Txt>}
      {period &&
        (editingPeriod ? (
          <PeriodForm key={period.start} period={period} onDone={() => setEditingPeriod(false)} />
        ) : (
          <Section title="Masa haid">
            <Txt variant="body">
              {formatDay(period.start)} – {period.end ? formatDay(period.end) : 'sekarang'}
            </Txt>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ubah masa ${formatDay(period.start)}`}
                onPress={() => setEditingPeriod(true)}
                style={styles.action}>
                <Txt variant="bold">Ubah masa</Txt>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Hapus masa ${formatDay(period.start)}`}
                onPress={confirmRemovePeriod}
                style={styles.action}>
                <Txt variant="bold" style={{ color: colors.destructive }}>
                  Hapus masa
                </Txt>
              </Pressable>
            </View>
          </Section>
        ))}
      <Section title="Aliran">
        <Chips
          options={FLOWS}
          isOn={(id) => note.flow === id}
          onToggle={(id) => save({ ...note, flow: note.flow === id ? undefined : (id as Flow) })}
        />
      </Section>
      <Section title="Nyeri">
        <Chips
          options={PAIN_OPTIONS}
          isOn={(id) => note.pain === Number(id)}
          onToggle={(id) => save({ ...note, pain: note.pain === Number(id) ? undefined : Number(id) })}
        />
      </Section>
      <Section title="Gejala">
        <Chips options={symptoms} isOn={(id) => note.symptoms.includes(id)} onToggle={(id) => save(toggleSymptom(note, id))} />
        <TextField
          label="Gejala lain"
          value={custom}
          onChangeText={setCustom}
          onSubmitEditing={addCustom}
          returnKeyType="done"
          placeholder="Ketik lalu tekan selesai"
        />
      </Section>
    </SubScreen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={[clayOf(colors), styles.section]}>
      <Txt variant="heading" accessibilityRole="header">{title}</Txt>
      {children}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    section: { padding: space.md, gap: space.md },
    actions: { flexDirection: 'row', gap: space.sm },
    action: { minHeight: 44, minWidth: 110, alignItems: 'center', justifyContent: 'center' },
  });
