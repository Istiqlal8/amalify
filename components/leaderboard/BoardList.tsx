import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import type { BoardRow } from '@/services/leaderboardService';

import { Podium } from './Podium';

/** Top three on a podium, everyone from rank 4 in a list underneath. */
export function BoardList({ rows }: { rows: BoardRow[] }) {
  const styles = useStyles(makeStyles);
  if (rows.length === 0) return <Txt variant="caption">Belum ada tilawah tercatat.</Txt>;
  const rest = rows.slice(3);
  return (
    <View style={styles.wrap}>
      <Podium rows={rows} />
      {rest.length > 0 && (
        <View style={styles.card}>
          {rest.map((r, j) => (
            <View key={r.userId} style={styles.row} accessible accessibilityLabel={`Peringkat ${j + 4}, ${r.name}, ${r.pages} halaman`}>
              <View style={styles.rank}>
                <Txt variant="bold">{j + 4}</Txt>
              </View>
              <Avatar name={r.name} url={r.avatarUrl} size={32} />
              <Txt variant="bold" numberOfLines={1} style={styles.flex}>
                {r.name}
              </Txt>
              <Txt variant="bold">{r.pages}</Txt>
              <Txt variant="caption">hlm</Txt>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { gap: space.lg },
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
    rank: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: c.muted },
    flex: { flex: 1 },
  });
