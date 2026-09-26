import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyDoa } from '@/components/home/DailyDoa';
import { Greeting } from '@/components/home/Greeting';
import { HomeMenu } from '@/components/home/HomeMenu';
import { PrayerHero } from '@/components/home/PrayerHero';
import { PrayerTimes } from '@/components/home/PrayerTimes';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { WeekStrip } from '@/components/home/WeekStrip';
import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';

export default function HomeScreen() {
  const styles = useStyles(makeStyles);
  const tabBarSpace = useTabBarSpace();

  return (
    <View style={styles.root}>
      <SoftBackdrop />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
          <Greeting />
          <WeekStrip />
          <PrayerHero />
          <PrayerTimes />
          <HomeMenu />
          <DailyDoa />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.card },
    flex: { flex: 1 },
    content: { paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: space.xl, gap: space.lg },
  });
