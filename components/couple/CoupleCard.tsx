import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { pushPartnerHaid, useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/services/supabase';

/**
 * Kartu undangan pasangan untuk istri: buat kode 6 huruf, bagikan ke suami,
 * lalu data haid otomatis terkirim setiap ada perubahan.
 */
export function CoupleCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { user, groupsReady } = useAuth();
  const { haid } = useLogs();
  const { pair, role, linked, partnerName, loading, error, create, regen, leave, refresh } = useCouple(groupsReady);
  const pushedAt = useRef(0);
  const [pushError, setPushError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Istri yang sudah terhubung: dorong otomatis setiap datanya berubah.
  useEffect(() => {
    if (!pair || role !== 'wife' || !linked) return;
    if (haid.at <= pushedAt.current) return;
    pushedAt.current = haid.at;
    pushPartnerHaid(haid).catch((e: unknown) => setPushError(e instanceof Error ? e.message : String(e)));
  }, [haid, pair, role, linked]);

  async function copyCode() {
    if (!pair) return;
    await Clipboard.setStringAsync(pair.invite_code);
    setCopied(true);
  }

  if (!supabase) return null;
  if (!user) {
    return (
      <View style={[clayOf(colors), styles.card]}>
        <Txt variant="heading">Mode pasangan</Txt>
        <Txt>Masuk di tab Akun dulu untuk menghubungkan ke suami.</Txt>
      </View>
    );
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">Mode pasangan</Txt>
      <Txt variant="caption">Bagikan status haid ke suami lewat kode undangan, seperti grup.</Txt>

      {!pair ? (
        <ClayButton label={loading ? 'Menyiapkan…' : 'Buat kode undangan'} disabled={loading} onPress={create} />
      ) : (
        <>
          <View style={styles.codeBox}>
            <Txt variant="caption">Kode undangan untuk suami</Txt>
            <Txt variant="heading" style={styles.code}>{pair.invite_code}</Txt>
            {copied && <Txt variant="caption">Disalin — kirim lewat WA/chat.</Txt>}
          </View>
          <ClayButton label="Salin kode" tone="soft" onPress={copyCode} />
          {linked ? (
            <Txt variant="bold">Terhubung dengan {partnerName ?? 'suami'}. Data terkirim otomatis.</Txt>
          ) : (
            <Txt variant="caption">Minta suami buka menu Pasangan lalu masukkan kode ini. Setelah terhubung, setiap perubahan haid terkirim otomatis.</Txt>
          )}
          <View style={styles.row}>
            <View style={styles.flex}>
              <ClayButton label="Kode baru" tone="soft" onPress={regen} />
            </View>
            <View style={styles.flex}>
              <ClayButton label={linked ? 'Putus hubungan' : 'Hapus undangan'} tone="soft" onPress={leave} />
            </View>
          </View>
          <ClayButton label="Muat ulang" tone="soft" onPress={refresh} />
        </>
      )}
      {(error ?? pushError) && <Txt style={{ color: colors.destructive }}>{error ?? pushError}</Txt>}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm },
    codeBox: { alignItems: 'center', gap: space.xs, paddingVertical: space.sm },
    code: { letterSpacing: 6, fontSize: 28 },
    row: { flexDirection: 'row', gap: space.sm },
    flex: { flex: 1 },
  });
