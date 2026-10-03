import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

type Props = { label: string; onPrev: () => void; onNext: () => void };

/** Navigasi bulan sebaris: < Sep 2026 > */
export function MonthNav({ label, onPrev, onNext }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.row}>
      <ClayButton label="<" tone="soft" onPress={onPrev} />
      <Txt variant="heading" style={styles.label}>
        {label}
      </Txt>
      <ClayButton label=">" tone="soft" onPress={onNext} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    label: { flex: 1, textAlign: 'center' },
  });
