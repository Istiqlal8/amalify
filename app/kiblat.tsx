import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { CompassDial } from '@/components/qibla/CompassDial';
import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, fonts, type Palette, radius, space } from '@/constants/theme';
import { compassPoint, isAligned, turnTo } from '@/domain/qibla';
import { useHeading } from '@/hooks/useHeading';
import { useQibla } from '@/hooks/useQibla';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

function Guidance({ turn, aligned }: { turn: number; aligned: boolean }) {
  const styles = useStyles(makeStyles);
  if (aligned) return <Txt variant="title" style={styles.aligned}>Menghadap kiblat</Txt>;
  const side = turn > 0 ? 'kanan' : 'kiri';
  return <Txt variant="title">Putar ke {side} {Math.round(Math.abs(turn))}°</Txt>;
}

/** Buzzes once each time the phone swings into line with the qibla. */
function useAlignedHaptic(aligned: boolean): void {
  const was = useRef(aligned);
  useEffect(() => {
    if (aligned && !was.current) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    was.current = aligned;
  }, [aligned]);
}

export default function QiblaScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { status, qibla, retry } = useQibla();
  const heading = useHeading(status === 'ready');
  const aligned = qibla !== null && heading !== null && isAligned(qibla.bearing, heading.degrees);
  useAlignedHaptic(aligned);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: 'Kiblat',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryDeep,
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
        }}
      />
      {status === 'locating' && <Txt>Mencari lokasi…</Txt>}
      {status === 'denied' && (
        <View style={styles.card}>
          <Txt>Izin lokasi dibutuhkan untuk menentukan arah kiblat dari tempatmu.</Txt>
          <ClayButton label="Buka pengaturan" onPress={() => Linking.openSettings()} />
        </View>
      )}
      {status === 'error' && (
        <View style={styles.card}>
          <Txt>Lokasi tidak ditemukan. Pastikan GPS aktif.</Txt>
          <ClayButton label="Coba lagi" tone="soft" onPress={retry} />
        </View>
      )}
      {qibla && (
        <>
          <CompassDial size={Math.min(width - space.md * 2, 340)} heading={heading?.degrees ?? 0} qibla={qibla.bearing} aligned={aligned} />
          {heading ? <Guidance turn={turnTo(qibla.bearing, heading.degrees)} aligned={aligned} /> : <Txt>Menunggu kompas…</Txt>}
          <View style={styles.stats}>
            <Stat value={`${Math.round(qibla.bearing)}° ${compassPoint(qibla.bearing)}`} label="Arah kiblat" />
            <Stat value={heading ? `${Math.round(heading.degrees)}° ${compassPoint(heading.degrees)}` : '–'} label="Arah HP" />
          </View>
          {heading !== null && heading.accuracy <= 1 && (
            <Txt variant="caption" style={styles.center}>Kompas kurang akurat. Gerakkan HP membentuk angka 8.</Txt>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.stat}>
      <Txt variant="heading">{value}</Txt>
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: space.md, gap: space.lg, alignItems: 'center', paddingBottom: space.xl },
    card: { ...clayOf(c), padding: space.md, gap: space.md, alignSelf: 'stretch' },
    aligned: { color: c.primaryDeep },
    stats: { flexDirection: 'row', gap: space.md, alignSelf: 'stretch' },
    stat: { ...clayOf(c), flex: 1, alignItems: 'center', padding: space.md, borderRadius: radius.md },
    center: { textAlign: 'center' },
  });
