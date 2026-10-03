import { Stack } from 'expo-router';

import { KhatamCard } from '@/components/tilawah/KhatamCard';
import { RangeForm } from '@/components/tilawah/RangeForm';
import { SessionHistory } from '@/components/tilawah/SessionHistory';
import { SubScreen } from '@/components/ui/SubScreen';
import { useTheme } from '@/providers/ThemeProvider';
import { stackHeader } from '@/components/ui/stackHeader';

/** The reading journal. Ticking the tilawah amalan stays on the Amalan screen. */
export default function TilawahScreen() {
  const { colors } = useTheme();

  return (
    <SubScreen>
      <Stack.Screen
        options={{
          title: 'Catat tilawah',
          ...stackHeader(colors),
        }}
      />
      <KhatamCard />
      <RangeForm />
      <SessionHistory />
    </SubScreen>
  );
}
