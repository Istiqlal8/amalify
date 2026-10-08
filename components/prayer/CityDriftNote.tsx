import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { cityLabel } from '@/domain/prayer';
import { useCityDrift } from '@/hooks/useCityDrift';
import { useStyles } from '@/hooks/useStyles';

/** Offers the schedule of the city the user is now in; renders nothing while they are home. */
export function CityDriftNote() {
  const styles = useStyles(makeStyles);
  const drift = useCityDrift();
  if (!drift) return null;

  return (
    <View style={styles.card}>
      <Txt variant="bold">{`Kamu di ${cityLabel(drift.here.name)}`}</Txt>
      <ClayButton label="Pakai jadwal sini" onPress={drift.accept} />
      <ClayButton label="Tetap" tone="soft" onPress={drift.dismiss} />
    </View>
  );
}

// A solid card of its own: it sits on both the pastel home and the dark one.
const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
  });
