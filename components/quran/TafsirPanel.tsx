import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useTafsir } from '@/hooks/useQuran';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { surah: number; ayat: number };

type PanelProps = Props & { /** Shown before the toggle, on the same row. */ leading?: ReactNode };

/** Collapsed "Tafsir" toggle under an ayah; the surah's tafsir loads on first open. */
export function TafsirPanel({ surah, ayat, leading }: PanelProps) {
  const styles = useStyles(makeStyles);
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        {leading}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((o) => !o)}
          style={styles.toggle}
          hitSlop={8}
        >
          <Txt variant="bold" style={styles.link}>
            {open ? 'Tutup tafsir' : 'Tafsir'}
          </Txt>
        </Pressable>
      </View>
      {open && <TafsirText surah={surah} ayat={ayat} />}
    </View>
  );
}

function TafsirText({ surah, ayat }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { data, error, retry } = useTafsir(surah);
  if (error) {
    return (
      <Txt style={{ color: colors.destructive }} onPress={retry}>
        Gagal memuat tafsir. Ketuk untuk coba lagi.
      </Txt>
    );
  }
  if (!data) return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  return (
    <View style={styles.body}>
      <Txt>{data[ayat - 1] ?? 'Tafsir ayat ini belum tersedia.'}</Txt>
      <Txt variant="caption">Tafsir Kemenag RI</Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    panel: { gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    toggle: { minHeight: 44, justifyContent: 'center' },
    link: { color: c.primaryDeep },
    loading: { alignSelf: 'flex-start', paddingVertical: space.sm },
    body: { gap: space.sm, padding: space.md, borderRadius: radius.sm, backgroundColor: c.muted },
  });
