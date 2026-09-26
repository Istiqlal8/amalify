import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { ayahAfter, nextStart, pagesBetween, type AyahRef } from '@/domain/tilawah';
import { useLogs } from '@/providers/LogsProvider';

import { SurahPicker } from './SurahPicker';

type Draft = { surah: number; ayah: string };

const toDraft = (ref: AyahRef): Draft => ({ surah: ref.surah, ayah: String(ref.ayah) });
const toRef = (d: Draft): AyahRef => ({ surah: d.surah, ayah: Number(d.ayah) });

/** From–to ayah range; pages are counted from the mushaf and added to today. */
export function RangeForm() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { tilawah, addTilawah } = useLogs();
  const start = nextStart(tilawah);
  const [from, setFrom] = useState<Draft>(toDraft(start));
  const [to, setTo] = useState<Draft>(toDraft(start));
  const pages = pagesBetween(toRef(from), toRef(to));

  function save() {
    if (!addTilawah(toRef(from), toRef(to))) return;
    const after = ayahAfter(toRef(to));
    setFrom(toDraft(after));
    setTo(toDraft(after));
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading" accessibilityRole="header">Catat bacaan</Txt>
      <Row label="Dari" draft={from} onChange={setFrom} />
      <Row label="Sampai" draft={to} onChange={setTo} />
      <Txt variant="bold" style={{ color: pages === null ? colors.destructive : colors.primaryDeep }}>
        {pages === null ? 'Ayat tidak valid atau terbalik' : `${pages} halaman`}
      </Txt>
      <ClayButton label="Simpan" onPress={save} disabled={pages === null} />
    </View>
  );
}

function Row({ label, draft, onChange }: { label: string; draft: Draft; onChange: (d: Draft) => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.rowWrap}>
      <Txt variant="caption">{label}</Txt>
      <View style={styles.row}>
        <SurahPicker label={`${label} surah`} value={draft.surah} onChange={(surah) => onChange({ surah, ayah: '1' })} />
        <TextInput
          accessibilityLabel={`${label} ayat`}
          value={draft.ayah}
          onChangeText={(ayah) => onChange({ ...draft, ayah: ayah.replace(/\D/g, '') })}
          keyboardType="number-pad"
          selectTextOnFocus
          maxLength={3}
          placeholder="Ayat"
          placeholderTextColor={colors.mutedForeground}
          style={styles.ayah}
        />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    rowWrap: { gap: space.xs },
    row: { flexDirection: 'row', gap: space.sm },
    ayah: {
      width: 80,
      minHeight: 48,
      textAlign: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      fontFamily: fonts.bodyBold,
      fontSize: 16,
      color: c.foreground,
    },
  });
