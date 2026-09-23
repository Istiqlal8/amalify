import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { TimeButton } from '@/components/ui/TimeButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import type { EventDraft } from '@/domain/groupEvent';
import { parseClock, type Clock } from '@/domain/reminders';
import { useStyles } from '@/hooks/useStyles';
import type { MemberToday } from '@/services/groupService';

type Kind = 'check' | 'count';
type Props = { today: string; members: MemberToday[]; onSave: (draft: EventDraft) => void; onCancel: () => void };

const KINDS: { id: Kind; label: string }[] = [
  { id: 'check', label: 'Centang' },
  { id: 'count', label: 'Hitungan' },
];
const NO_PIC = '';

function toIso(day: string, clock: Clock): string {
  const [y, m, d] = day.split('-').map(Number);
  const { hour, minute } = parseClock(clock);
  return new Date(y, m - 1, d, hour, minute).toISOString();
}

export function EventForm({ today, members, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(today);
  const [clock, setClock] = useState<Clock>('08:00');
  const [pic, setPic] = useState(NO_PIC);
  const [kind, setKind] = useState<Kind>('check');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const counted = kind === 'count';
  const valid = title.trim() !== '' && (!counted || Number(target) >= 1);

  function save() {
    onSave({
      title: title.trim(),
      startsAt: toIso(day, clock),
      pic: pic === NO_PIC ? null : pic,
      target: counted ? Math.round(Number(target)) : 1,
      unit: counted ? unit.trim() : '',
    });
  }

  return (
    <View style={styles.card}>
      <TextField label="Nama program" value={title} onChangeText={setTitle} maxLength={80} placeholder="Khataman bulanan" />
      <Txt variant="bold">Waktu</Txt>
      <View style={styles.row}>
        <DateButton label="Tanggal" value={day} onChange={setDay} />
        <TimeButton label="Jam" value={clock} onChange={setClock} />
      </View>
      <Txt variant="bold">PIC</Txt>
      <PillTabs options={[{ id: NO_PIC, label: 'Belum ada' }, ...members.map((m) => ({ id: m.userId, label: m.name }))]} value={pic} onChange={setPic} />
      <PillTabs options={KINDS} value={kind} onChange={setKind} />
      {counted && (
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField label="Target" value={target} onChangeText={setTarget} keyboardType="number-pad" maxLength={6} placeholder="30" />
          </View>
          <View style={styles.flex}>
            <TextField label="Satuan" value={unit} onChangeText={setUnit} maxLength={12} placeholder="juz" />
          </View>
        </View>
      )}
      <ClayButton label="Simpan" disabled={!valid} onPress={save} />
      <ClayButton label="Batal" tone="soft" onPress={onCancel} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' },
    flex: { flex: 1 },
  });
