import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import type { Word } from '@/services/quranComApi';

import { TajweedText } from './TajweedText';

type Props = { words: Word[]; colored: boolean };

/** Each Arabic word with its Indonesian meaning underneath, laid out right to left. */
export function WordByWord({ words, colored }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      {words.map((w, i) => (
        <View key={i} style={styles.word}>
          <TajweedText markup={w.tajweed} colored={colored} style={styles.arab} />
          <Txt variant="caption" style={styles.arti}>
            {w.arti}
          </Txt>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: space.sm, rowGap: space.md },
    word: { alignItems: 'center', maxWidth: 120, paddingHorizontal: space.xs, borderBottomWidth: 1, borderBottomColor: c.border },
    arab: { fontSize: 26, lineHeight: 52, textAlign: 'center' },
    arti: { textAlign: 'center', fontSize: 12, lineHeight: 16 },
  });
