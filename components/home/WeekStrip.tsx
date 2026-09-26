import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

const LETTERS = ['S', 'S', 'R', 'K', 'J', 'S', 'A'];

/** Monday-first days of this week, today circled. */
export function WeekStrip() {
  const styles = useStyles(makeStyles);
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = LETTERS.map((_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));

  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const isToday = d.getDate() === today.getDate();
        return (
          <View key={i} style={styles.day}>
            <Txt variant="caption" style={isToday && styles.strong}>
              {LETTERS[i]}
            </Txt>
            <View style={[styles.dot, isToday && styles.dotToday]}>
              <Txt style={[styles.num, isToday && styles.strong]}>{d.getDate()}</Txt>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row' },
    day: { flex: 1, alignItems: 'center', gap: 6 },
    dot: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotToday: {
      backgroundColor: c.card,
      boxShadow: `0px 4px 10px ${c.shadow}`,
    },
    num: { fontFamily: fonts.body, fontSize: 16, color: c.foreground },
    strong: { fontFamily: fonts.bodyBold, color: c.primaryDeep },
  });
