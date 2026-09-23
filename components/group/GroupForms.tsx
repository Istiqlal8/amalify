import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';
import { useStyles } from '@/hooks/useStyles';

type Props = { onCreate: (name: string) => Promise<void>; onJoin: (code: string) => Promise<void> };

export function GroupForms({ onCreate, onJoin }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(action: () => Promise<void>, reset: () => void) {
    setBusy(true);
    await action();
    reset();
    setBusy(false);
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <TextField label="Nama grup baru" value={name} onChangeText={setName} maxLength={40} placeholder="Halaqoh Ahad" />
      <ClayButton
        label="Buat grup"
        disabled={busy || !name.trim()}
        onPress={() => submit(() => onCreate(name.trim()), () => setName(''))}
      />
      <TextField
        label="Kode undangan"
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        maxLength={6}
        autoCapitalize="characters"
        placeholder="AB12CD"
      />
      <ClayButton
        label="Gabung"
        tone="soft"
        disabled={busy || code.trim().length !== 6}
        onPress={() => submit(() => onJoin(code.trim()), () => setCode(''))}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
  });
