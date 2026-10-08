import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { FLOWS, PAINS } from '@/domain/haidDay';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { PARTNER_STATE_LABEL, partnerStatus } from '@/domain/couple';
import { forecast } from '@/domain/cyclePhase';
import { daysBetween, formatDay, sortedPeriods } from '@/domain/cycle';
import { dayOfPeriod } from '@/domain/haid';
import type { HaidLog } from '@/domain/haid';

type Props = { log: HaidLog; today: string; name?: string | null };

const flowLabel = (id?: string): string => FLOWS.find((f) => f.id === id)?.label ?? id ?? '-';

/** Tampilan baca-saja seluruh detail haid istri untuk suami yang terhubung. */
export function PartnerHaidView({ log, today, name }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const status = partnerStatus(log, today);
  const f = forecast(log);
  const periods = sortedPeriods(log).slice(-10).reverse();
  const notedDays = Object.entries(log.days ?? {})
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 10);

  const headline =
    status.state === 'haid' || status.state === 'nifas'
      ? `${PARTNER_STATE_LABEL[status.state]} · hari ke-${status.day}`
      : PARTNER_STATE_LABEL[status.state];

  return (
    <View style={styles.wrap}>
      <View style={[clayOf(colors), styles.card]}>
        <Txt variant="caption">{name ? `Status ${name}` : 'Status istri'}</Txt>
        <Txt variant="heading">{headline}</Txt>
        {log.pregnant && <Txt variant="caption">Hamil sejak {formatDay(log.pregnant)}</Txt>}
        {log.mandiDue && <Txt variant="caption">Mandi wajib tertunda sejak {formatDay(log.mandiDue)}.</Txt>}
        {f && status.state !== 'hamil' && (
          <Txt variant="caption">
            Perkiraan haid berikutnya {formatDay(f.nextStart)} · siklus rata-rata {f.avgCycle} hari.
          </Txt>
        )}
      </View>

      <View style={[clayOf(colors), styles.card]}>
        <Txt variant="heading">Riwayat</Txt>
        {periods.length === 0 && <Txt variant="caption">Belum ada riwayat haid tercatat.</Txt>}
        {periods.map((p) => {
          const end = p.end ?? today;
          const len = daysBetween(p.start, end) + (p.end === undefined ? 0 : 1);
          const running = p.end === undefined;
          return (
            <View key={p.start} style={styles.row}>
              <Txt style={styles.flex}>
                {formatDay(p.start)} — {running ? 'berjalan' : formatDay(p.end!)}
                {p.nifas ? ' · nifas' : ''}
              </Txt>
              <Txt variant="caption">
                {running ? `hari ke-${dayOfPeriod(p, today)}` : `${len} hari`}
              </Txt>
            </View>
          );
        })}
      </View>

      {(log.qadhaPaid && Object.keys(log.qadhaPaid).length > 0) || notedDays.length > 0 ? (
        <View style={[clayOf(colors), styles.card]}>
          <Txt variant="heading">Catatan</Txt>
          {log.qadhaPaid &&
            Object.entries(log.qadhaPaid).map(([year, n]) => (
              <Txt key={year} variant="caption">Qadha Ramadan {year}: {n} terbayar.</Txt>
            ))}
          {notedDays.map(([day, n]) => (
            <View key={day} style={styles.row}>
              <Txt style={styles.flex}>{formatDay(day)}</Txt>
              <Txt variant="caption">
                {[n.flow ? flowLabel(n.flow) : null, n.pain !== undefined ? PAINS[n.pain] : null, ...n.symptoms]
                  .filter(Boolean)
                  .join(' · ')}
              </Txt>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    wrap: { gap: space.md },
    card: { padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    flex: { flex: 1 },
  });
