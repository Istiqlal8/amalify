import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoardList } from '@/components/leaderboard/BoardList';
import { PillTabs } from '@/components/ui/PillTabs';
import { Txt } from '@/components/ui/Txt';
import { type Palette, space } from '@/constants/theme';
import { PERIODS, type Period } from '@/domain/period';
import { useGroups } from '@/hooks/useGroups';
import { useStyles } from '@/hooks/useStyles';
import { useTilawahBoard } from '@/hooks/useTilawahBoard';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/services/supabase';
import { stackHeader } from '@/components/ui/stackHeader';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';

type Scope = 'grup' | 'global';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'grup', label: 'Grup' },
  { id: 'global', label: 'Global' },
];

export default function LeaderboardScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { user, groupsReady } = useAuth();
  const { today } = useLogs();
  const { list } = useGroups(groupsReady);
  const [scope, setScope] = useState<Scope>('grup');
  const [period, setPeriod] = useState<Period>('minggu');
  const [picked, setPicked] = useState<string | null>(null);
  const group = list.find((g) => g.id === picked) ?? list[0] ?? null;
  const showBoard = scope === 'global' || group !== null;
  const board = useTilawahBoard(groupsReady && showBoard, period, today, scope === 'global' ? null : (group?.id ?? null));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SoftBackdrop />
      <Stack.Screen
        options={{
          title: 'Peringkat tilawah',
          ...stackHeader(colors),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {!supabase ? (
          <Txt>Grup belum dikonfigurasi.</Txt>
        ) : !user ? (
          <Txt>Masuk di tab Akun untuk melihat leaderboard.</Txt>
        ) : (
          <>
            <PillTabs options={SCOPES} value={scope} onChange={setScope} />
            {scope === 'grup' && list.length > 1 && (
              <PillTabs options={list.map((g) => ({ id: g.id, label: g.name }))} value={group?.id ?? ''} onChange={setPicked} />
            )}
            <PillTabs options={PERIODS} value={period} onChange={setPeriod} />
            {!showBoard ? (
              <Txt>Gabung grup dulu di tab Grup.</Txt>
            ) : board.loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : board.error ? (
              <Txt style={{ color: colors.destructive }}>{board.error}</Txt>
            ) : (
              <BoardList rows={board.rows} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  });
