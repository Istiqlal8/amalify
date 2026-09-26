import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { careOf, isNaturalCycle } from '@/domain/care';
import { healthFlags, pmsSymptoms, regularity } from '@/domain/haidAnalysis';
import { haidReportHtml } from '@/domain/haidReport';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** Regularity, health flags and PMS pattern, plus a PDF summary to take to a doctor. */
export function AnalysisCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today } = useLogs();
  const [busy, setBusy] = useState(false);
  const natural = isNaturalCycle(careOf(haid));
  const reg = regularity(haid);
  const flags = healthFlags(haid, today, natural);
  const pms = pmsSymptoms(haid, 3);

  async function exportPdf() {
    setBusy(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: haidReportHtml(haid, today, natural) });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Ringkasan siklus' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">Analisis</Txt>
      <Txt>
        {reg
          ? `Siklus ${reg.regular ? 'teratur' : 'kurang teratur'} (selisih ${reg.spread} hari).`
          : 'Keteraturan siklus muncul setelah 3 siklus tercatat.'}
      </Txt>
      {flags.length > 0 && (
        <View style={styles.flags}>
          {flags.map((f) => (
            <Txt key={f} style={{ color: colors.destructive }}>
              • {f}
            </Txt>
          ))}
          <Txt variant="caption">Sebaiknya konsultasikan ke dokter atau bidan.</Txt>
        </View>
      )}
      {pms.length > 0 && <Txt>Sering muncul sebelum haid: {pms.map((p) => p.symptom).join(', ')}.</Txt>}
      <ClayButton label="Ekspor PDF" tone="soft" disabled={busy} onPress={exportPdf} />
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm },
    flags: { gap: space.xs },
  });
