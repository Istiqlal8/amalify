import { StyleSheet, Text, type TextStyle } from 'react-native';

import { fonts, type Palette } from '@/constants/theme';
import { joinSegments, parseTajweed, RULE_COLOR } from '@/domain/tajweed';
import { useStyles } from '@/hooks/useStyles';

type Props = { markup: string; colored: boolean; style?: TextStyle };

/** Uthmani Arabic from quran.com markup, with each tajwid rule in its colour when `colored`. */
export function TajweedText({ markup, colored, style }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <Text style={[styles.arab, style]}>
      {(colored ? joinSegments(parseTajweed(markup)) : parseTajweed(markup)).map((s, i) =>
        colored && s.rule ? (
          <Text key={i} style={{ color: RULE_COLOR[s.rule] }}>
            {s.text}
          </Text>
        ) : (
          s.text
        ),
      )}
    </Text>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    arab: {
      fontFamily: fonts.arabic,
      fontSize: 28,
      lineHeight: 60,
      textAlign: 'right',
      writingDirection: 'rtl',
      color: c.foreground,
    },
  });
