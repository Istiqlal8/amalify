import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Chips } from '@/components/haid/Chips';
import { SubScreen } from '@/components/ui/SubScreen';
import { PillPack } from '@/components/haid/PillPack';
import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { TimeButton } from '@/components/ui/TimeButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { careOf, pillDay, togglePill, withCare, type Care, type PillRegimen } from '@/domain/care';
import { useLogs } from '@/providers/LogsProvider';
import { useReminders } from '@/providers/ReminderProvider';

const PACKS = [
  { id: '21+7', label: '21 + 7' },
  { id: '24+4', label: '24 + 4' },
  { id: '28+0', label: '28' },
];

export default function PillScreen() {
  const { haid, editHaid } = useLogs();
  const care = careOf(haid);
  const setCare = (change: (c: Care) => Care) => editHaid((h, now) => withCare(h, change(careOf(h)), now));
  return (
    <SubScreen>
      {care.pill ? <Regimen care={care} reg={care.pill} setCare={setCare} /> : <Setup setCare={setCare} />}
    </SubScreen>
  );
}

function Setup({ setCare }: { setCare: (change: (c: Care) => Care) => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { today } = useLogs();
  const { requestPermission } = useReminders();
  const [pack, setPack] = useState('21+7');
  const [start, setStart] = useState(today);
  const [time, setTime] = useState('20:00');

  function save() {
    const [active, placebo] = pack.split('+').map(Number);
    requestPermission();
    setCare((c) => ({ ...c, pill: { start, active, placebo, time } }));
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading" accessibilityRole="header">Isi satu strip</Txt>
      <Chips options={PACKS} isOn={(id) => id === pack} onToggle={setPack} />
      <View style={styles.row}>
        <Txt style={styles.flex}>Pil pertama</Txt>
        <DateButton label="Pil pertama" value={start} max={today} onChange={setStart} />
      </View>
      <View style={styles.row}>
        <Txt style={styles.flex}>Pengingat</Txt>
        <TimeButton label="Pengingat" value={time} onChange={setTime} />
      </View>
      <ClayButton label="Mulai" onPress={save} />
    </View>
  );
}

type RegimenProps = { care: Care; reg: PillRegimen; setCare: (change: (c: Care) => Care) => void };

function Regimen({ care, reg, setCare }: RegimenProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { today } = useLogs();
  const pos = pillDay(reg, today);
  const taken = care.pillTaken.includes(today);

  function confirmStop() {
    Alert.alert('Berhenti pil KB?', undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Berhenti', style: 'destructive', onPress: () => setCare((c) => ({ ...c, pill: undefined, pillTaken: [] })) },
    ]);
  }

  return (
    <>
      <View style={[clayOf(colors), styles.card]}>
        <Txt variant="heading">{pos ? `Pil ke-${pos.index + 1}${pos.placebo ? ' (plasebo)' : ''}` : 'Belum mulai'}</Txt>
        <PillPack care={care} reg={reg} today={today} />
        {pos && !pos.placebo && (
          <ClayButton label={taken ? 'Batal minum' : 'Sudah minum'} tone={taken ? 'soft' : 'primary'} onPress={() => setCare((c) => togglePill(c, today))} />
        )}
      </View>
      <View style={[clayOf(colors), styles.card]}>
        <View style={styles.row}>
          <Txt style={styles.flex}>Pengingat</Txt>
          <TimeButton label="Pengingat" value={reg.time} onChange={(time) => setCare((c) => ({ ...c, pill: { ...reg, time } }))} />
        </View>
        <ClayButton label="Berhenti" tone="soft" onPress={confirmStop} />
      </View>
    </>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
  });
