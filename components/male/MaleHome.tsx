import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityDriftNote } from '@/components/prayer/CityDriftNote';
import { male, maleFonts, maleKicker } from '@/constants/male';
import { formatHijri, toHijri } from '@/domain/hijri';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';
import { useAuth } from '@/providers/AuthProvider';

import { MalePrayerPanel } from './MalePrayerPanel';
import { MaleStats } from './MaleStats';
import { MaleTools } from './MaleTools';

const WEEKDAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

/**
 * Beranda laki-laki, dibangun terpisah dari beranda perempuan: latar gelap, panel
 * sholat dengan centang langsung, angka ringkas, lalu perkakas. Tanpa kebun, mood,
 * atau kartu kaca pastel.
 */
export function MaleHome() {
  const tabBarSpace = useTabBarSpace();
  const { user } = useAuth();
  const name = user?.user.givenName ?? user?.user.name;
  const now = new Date();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
          <View style={styles.header}>
            <Text style={maleKicker}>{`${WEEKDAYS[now.getDay()]} · ${formatHijri(toHijri(now))}`}</Text>
            <Text style={styles.salam} accessibilityRole="header">
              {name ? `Assalamu'alaikum, ${name}` : "Assalamu'alaikum"}
            </Text>
          </View>
          <CityDriftNote />
          <MalePrayerPanel />
          <MaleStats />
          <MaleTools />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: male.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  header: { gap: 6, paddingHorizontal: 4 },
  salam: { fontFamily: maleFonts.bold, fontSize: 24, lineHeight: 30, color: male.ink },
});
