import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContinueReading } from '@/components/home/ContinueReading';
import { DailyDoa } from '@/components/home/DailyDoa';
import { Greeting } from '@/components/home/Greeting';
import { HomeCard } from '@/components/home/HomeCard';
import { HomeMenu } from '@/components/home/HomeMenu';
import { MoodCheck } from '@/components/home/MoodCheck';
import { PrayerHero } from '@/components/home/PrayerHero';
import { PrayerTimes } from '@/components/home/PrayerTimes';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { type Palette } from '@/constants/theme';
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
          <HomeCard>
            <PrayerHero />
            <PrayerTimes />
          </HomeCard>
          <MoodCheck />
          <HomeCard>
            <ContinueReading />
          </HomeCard>
          <HomeCard>
            <HomeMenu />
          </HomeCard>
          <HomeCard>
            <DailyDoa />
          </HomeCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.card },
    flex: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 20, gap: 16 },
  });
