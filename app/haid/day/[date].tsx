import { Stack, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chips } from '@/components/haid/Chips';
import { HaidScroll } from '@/components/haid/HaidScroll';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { formatDay } from '@/domain/cycle';
import { isHaidDay } from '@/domain/haid';
import { customSymptoms, FLOWS, noteOf, PAINS, setDayNote, SYMPTOMS, toggleSymptom, type DayNote, type Flow } from '@/domain/haidDay';
import { useLogs } from '@/providers/LogsProvider';

const PAIN_OPTIONS = PAINS.map((label, i) => ({ id: String(i), label }));

export default function DayNoteScreen() {
  const { colors } = useTheme();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { haid, editHaid } = useLogs();
  const [custom, setCustom] = useState('');
  const note = noteOf(haid, date);
  const symptoms = [...SYMPTOMS, ...customSymptoms(haid)].map((s) => ({ id: s, label: s }));
  const save = (next: DayNote) => editHaid((h, now) => setDayNote(h, date, next, now));

  function addCustom() {
    const name = custom.trim();
    if (name && !note.symptoms.includes(name)) save({ ...note, symptoms: [...note.symptoms, name] });
    setCustom('');
  }

  return (
    <HaidScroll>
      <Stack.Screen options={{ title: formatDay(date) }} />
      {isHaidDay(haid, date) && <Txt variant="bold" style={{ color: colors.primaryDeep }}>Hari haid</Txt>}
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
    </HaidScroll>
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
  });
