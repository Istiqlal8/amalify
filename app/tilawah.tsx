import { Stack } from 'expo-router';

import { CountItem } from '@/components/CountItem';
import { KhatamCard } from '@/components/tilawah/KhatamCard';
import { RangeForm } from '@/components/tilawah/RangeForm';
import { SessionHistory } from '@/components/tilawah/SessionHistory';
import { SubScreen } from '@/components/ui/SubScreen';
import { useTheme } from '@/providers/ThemeProvider';
import { countOf } from '@/domain/dayLog';
import { TILAWAH_ID } from '@/domain/plan';
import { useLogs } from '@/providers/LogsProvider';
import { stackHeader } from '@/components/ui/stackHeader';

export default function TilawahScreen() {
  const { colors } = useTheme();
  const { plan, todayEntry, setToday } = useLogs();
  const item = plan.items.find((it) => it.id === TILAWAH_ID);

  return (
    <SubScreen>
      <Stack.Screen
        options={{
          title: 'Catat tilawah',
          ...stackHeader(colors),
        }}
      />
      <KhatamCard />
      {item && (
        <CountItem
          label="Hari ini"
          count={countOf(todayEntry, TILAWAH_ID)}
          target={item.target}
          unit={item.unit}
          onChange={(v) => setToday(TILAWAH_ID, v)}
        />
      )}
      <RangeForm />
      <SessionHistory />
    </SubScreen>
  );
}
