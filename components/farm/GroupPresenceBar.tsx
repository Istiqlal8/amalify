import { StyleSheet, Text, View } from 'react-native';

import { farmRadius } from '@/constants/farm';
import { type Palette, fonts, space } from '@/constants/theme';
import { firstName, type Players } from '@/domain/groupFarm';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

const SHOWN = 4;

type Props = { players: Players; connected: boolean };

/**
 * Who is in the garden right now, by name. The spec asks that presence never be "some animal
 * walked past": when the channel drops we say so instead of leaving the characters looking live.
 */
export function GroupPresenceBar({ players, connected }: Props) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const names = Object.values(players).map((p) => firstName(p.name, 8));
  const extra = names.length - SHOWN;
  const text = !connected
    ? 'Menghubungkan…'
    : names.length === 0
      ? 'Belum ada yang lain di kebun'
      : `${names.slice(0, SHOWN).join(', ')}${extra > 0 ? ` +${extra}` : ''} di kebun`;
  return (
    <View style={s.bar} accessibilityLiveRegion="polite">
      <View style={[s.dot, { backgroundColor: connected ? '#4ADE80' : colors.mutedForeground }]} />
      <Text style={s.text} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      paddingHorizontal: space.sm,
      paddingVertical: 5,
      borderRadius: farmRadius.chip,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    text: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 12, color: c.foreground },
  });
