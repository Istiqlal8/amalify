import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './Txt';

export function TextField({ label, ...rest }: TextInputProps & { label: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Txt variant="bold">{label}</Txt>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { gap: space.xs },
    input: {
      minHeight: 48,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.card,
      fontFamily: fonts.body,
      fontSize: 16,
      color: c.foreground,
    },
  });
