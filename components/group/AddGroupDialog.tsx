import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

type Mode = 'buat' | 'gabung';

const MODES: { id: Mode; label: string }[] = [
  { id: 'buat', label: 'Buat grup' },
  { id: 'gabung', label: 'Gabung' },
];

type Props = {
  onCreate: (name: string) => Promise<void>;
  onJoin: (code: string) => Promise<void>;
  onClose: () => void;
};

/** Dialog to start a new group or join one with an invite code. */
export function AddGroupDialog({ onCreate, onJoin, onClose }: Props) {
  const styles = useStyles(makeStyles);
  const [mode, setMode] = useState<Mode>('buat');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const ready = mode === 'buat' ? name.trim().length > 0 : code.trim().length === 6;

  async function submit() {
    setBusy(true);
    await (mode === 'buat' ? onCreate(name.trim()) : onJoin(code.trim()));
    setBusy(false);
    onClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup" />
        <Pressable style={styles.card} onPress={() => {}}>
          <Txt variant="heading">Tambah grup</Txt>
          <PillTabs options={MODES} value={mode} onChange={setMode} />
          {mode === 'buat' ? (
            <TextField label="Nama grup" value={name} onChangeText={setName} maxLength={40} placeholder="Halaqoh Ahad" autoFocus />
          ) : (
            <TextField
              label="Kode undangan"
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              placeholder="AB12CD"
              autoFocus
            />
          )}
          <ClayButton label={mode === 'buat' ? 'Buat' : 'Gabung'} disabled={busy || !ready} onPress={submit} />
          <ClayButton label="Batal" tone="soft" onPress={onClose} />
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', padding: space.md, backgroundColor: 'rgba(0,0,0,0.3)' },
    card: { ...frostOf(c), backgroundColor: c.card, borderRadius: radius.lg, padding: space.lg, gap: space.md },
  });
