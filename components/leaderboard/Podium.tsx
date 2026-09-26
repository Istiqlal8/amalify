import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import type { BoardRow } from '@/services/leaderboardService';

// Printed order is 2 · 1 · 3, so the winner stands in the middle on the tallest step.
const PLACES = [
  { rank: 2, height: 72, medal: '#B8C2CC', avatar: 60 },
  { rank: 1, height: 104, medal: '#F5B400', avatar: 76 },
  { rank: 3, height: 52, medal: '#CD7F4A', avatar: 60 },
];

/** Top three readers on podium steps. */
export function Podium({ rows }: { rows: BoardRow[] }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.podium}>
      {PLACES.map(({ rank, height, medal, avatar }) => {
        const r = rows[rank - 1];
        if (!r) return <View key={rank} style={styles.place} />;
        return (
          <View key={rank} style={styles.place} accessible accessibilityLabel={`Juara ${rank}, ${r.name}, ${r.pages} halaman`}>
            <View style={[styles.ring, { borderColor: medal, borderRadius: avatar / 2 + 4 }]}>
              <Avatar name={r.name} url={r.avatarUrl} size={avatar} />
            </View>
            <Txt variant="bold" numberOfLines={1} style={styles.center}>
              {r.name}
            </Txt>
            <Txt variant="caption">{r.pages} hlm</Txt>
            <View style={[styles.step, { height, backgroundColor: medal }]}>
              <Txt variant="heading" style={styles.rank}>
                {rank}
              </Txt>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    podium: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
    place: { flex: 1, alignItems: 'center', gap: space.xs },
    ring: { borderWidth: 3, padding: 2 },
    center: { textAlign: 'center' },
    step: { alignSelf: 'stretch', marginTop: space.xs, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, alignItems: 'center', paddingTop: space.sm },
    rank: { color: '#FFFFFF' },
  });
