import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { GroupForms } from '@/components/group/GroupForms';
import { MemberGarden } from '@/components/group/MemberGarden';
import { MenuTile } from '@/components/home/MenuTile';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { useGroups, useMembersToday } from '@/hooks/useGroups';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { supabase } from '@/services/supabase';

export default function GroupScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { user, groupsReady } = useAuth();
  const { today } = useLogs();
  const { list, error, create, join } = useGroups(groupsReady);
  const [picked, setPicked] = useState<string | null>(null);
  const selected = list.find((g) => g.id === picked) ?? list[0] ?? null;
  const members = useMembersToday(selected?.id ?? null, today);

  if (!supabase) return <Screen title="Grup"><Txt>Grup belum dikonfigurasi.</Txt></Screen>;
  if (!user) return <Screen title="Grup"><Txt>Masuk di tab Akun untuk bergabung dengan grup.</Txt></Screen>;

  return (
    <Screen title="Grup">
      {list.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {list.map((g) => {
            const active = g.id === selected?.id;
            return (
              <Pressable
                key={g.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setPicked(g.id)}
                style={[styles.chip, active && styles.chipActive]}>
                <Txt variant="bold" style={active ? { color: colors.onPrimary } : undefined}>
                  {g.name}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      {selected && <MemberGarden group={selected} members={members} />}
      {selected && (
        <View style={styles.tiles}>
          <MenuTile
            href={{ pathname: '/event', params: { group: selected.id } }}
            label="Event"
            icon={{ ios: 'calendar', android: 'event', web: 'event' }}
          />
          <MenuTile
            href={{ pathname: '/kas', params: { group: selected.id } }}
            label="Kas grup"
            icon={{ ios: 'banknote.fill', android: 'payments', web: 'payments' }}
          />
        </View>
      )}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      <GroupForms onCreate={create} onJoin={join} />
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    chips: { gap: space.sm },
    tiles: { flexDirection: 'row' },
    chip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipActive: { backgroundColor: c.primaryDeep, borderColor: c.primary },
  });
