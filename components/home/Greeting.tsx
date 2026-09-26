import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette } from '@/constants/theme';
import { formatHijri, toHijri } from '@/domain/hijri';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/providers/AuthProvider';

const WEEKDAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

export function Greeting() {
  const styles = useStyles(makeStyles);
  const { user } = useAuth();
  const name = user?.user.givenName ?? user?.user.name;
  const now = new Date();

  return (
    <View>
      <Txt accessibilityRole="header" style={styles.salam}>{name ? `Assalamu'alaikum, ${name}` : "Assalamu'alaikum"}</Txt>
      <Txt variant="caption" style={styles.date}>{`${WEEKDAYS[now.getDay()]} · ${formatHijri(toHijri(now))}`}</Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    salam: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, textAlign: 'center', color: c.foreground },
    date: { textAlign: 'center', marginTop: 4 },
  });
