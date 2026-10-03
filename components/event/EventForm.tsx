import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NO_PIC, PicField, seedPic } from '@/components/event/PicField';
import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { TimeButton } from '@/components/ui/TimeButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { clampProgress, type EventDraft, type GroupEvent } from '@/domain/groupEvent';
import { formatClock, parseClock, type Clock } from '@/domain/reminders';
import { dateKey } from '@/domain/dayLog';
import { useStyles } from '@/hooks/useStyles';
import type { MemberToday } from '@/services/groupService';

type Kind = 'check' | 'count';
/** `initial` fills the form when editing an existing program. */
type Props = { today: string; members: MemberToday[]; initial?: GroupEvent; onSave: (draft: EventDraft) => void; onCancel: () => void };

const KINDS: { id: Kind; label: string }[] = [
  { id: 'check', label: 'Centang' },
  { id: 'count', label: 'Hitungan' },
];
function toIso(day: string, clock: Clock): string {
  const [y, m, d] = day.split('-').map(Number);
  const { hour, minute } = parseClock(clock);
  return new Date(y, m - 1, d, hour, minute).toISOString();
}

export function EventForm({ today, members, initial, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const start = initial ? new Date(initial.startsAt) : null;
  const wasCounted = initial !== undefined && (initial.target > 1 || initial.unit !== '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [day, setDay] = useState(start ? dateKey(start) : today);
  const [clock, setClock] = useState<Clock>(start ? formatClock(start.getHours(), start.getMinutes()) : '08:00');
  const [pic, setPic] = useState(seedPic(members, initial?.pic));
  const [kind, setKind] = useState<Kind>(wasCounted ? 'count' : 'check');
  const [target, setTarget] = useState(wasCounted ? String(initial.target) : '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [progress, setProgress] = useState(initial ? String(initial.progress) : '0');
  const counted = kind === 'count';
  const valid = title.trim() !== '' && (!counted || Number(target) >= 1);

  function save() {
    const size = counted ? Math.round(Number(target)) : 1;
    onSave({
      title: title.trim(),
      startsAt: toIso(day, clock),
      pic: pic === NO_PIC ? null : pic,
      target: size,
      unit: counted ? unit.trim() : '',
      progress: clampProgress(Number(progress), size),
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
      <PicField members={members} value={pic} onChange={setPic} />
      <PillTabs options={KINDS} value={kind} onChange={setKind} />
      {counted && (
        <>
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField label="Target" value={target} onChangeText={setTarget} keyboardType="number-pad" maxLength={6} placeholder="30" />
            </View>
            <View style={styles.flex}>
              <TextField label="Satuan" value={unit} onChangeText={setUnit} maxLength={12} placeholder="juz" />
            </View>
          </View>
          {initial && <TextField label="Progres" value={progress} onChangeText={setProgress} keyboardType="number-pad" maxLength={6} placeholder="0" />}
        </>
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
