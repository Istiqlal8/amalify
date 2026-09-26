import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import type { Palette } from '@/constants/theme';
import { formatHijri, toHijri } from '@/domain/hijri';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/providers/AuthProvider';

const WEEKDAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

/** Small-caps weekday and Hijri date over a serif salam with the name in italic. */
export function Greeting() {
  const styles = useStyles(makeStyles);
  const { user } = useAuth();
  const name = user?.user.givenName ?? user?.user.name;
  const now = new Date();

  return (
    <View style={styles.wrap}>
      <Txt style={styles.date}>{`${WEEKDAYS[now.getDay()]} · ${formatHijri(toHijri(now))}`}</Txt>
      <Txt accessibilityRole="header" style={styles.salam}>
        {"Assalamu'alaikum"}
        {name ? ', ' : ''}
        {name ? <Txt style={styles.name}>{name}</Txt> : null}
      </Txt>
    </View>
  );
}

const makeStyles = (c: Palette) => {
  const k = inkOf(c);
  return StyleSheet.create({
    wrap: { gap: 4 },
    date: { fontFamily: mihrabFonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 1.6, textTransform: 'uppercase', color: k.inkSoft },
    salam: { fontFamily: mihrabFonts.displayRegular, fontSize: 30, lineHeight: 36, color: k.ink },
    name: { fontFamily: mihrabFonts.displayItalic, fontSize: 30, lineHeight: 36, color: k.accent },
  });
};
