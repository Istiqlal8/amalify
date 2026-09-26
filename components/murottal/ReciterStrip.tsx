import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, space } from '@/constants/theme';
import { RECITERS, type Reciter } from '@/domain/murottal';
import { useStyles } from '@/hooks/useStyles';

import { ReciterAvatar } from './ReciterAvatar';

type Props = { value: Reciter; onChange: (r: Reciter) => void };

/** Row of round reciter avatars; the picked one is ringed. */
export function ReciterStrip({ value, onChange }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {RECITERS.map((r) => {
        const active = r.id === value.id;
        return (
          <Pressable
            key={r.id}
            onPress={() => onChange(r)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={r.name}
            style={styles.item}>
            <View style={[styles.ring, active && styles.ringActive]}>
              <ReciterAvatar reciter={r} size={72} />
            </View>
            <Txt numberOfLines={2} style={[styles.name, active && styles.nameActive]}>
              {r.name}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { gap: space.md, paddingVertical: space.xs },
    item: { width: 88, alignItems: 'center', gap: space.xs },
    ring: { padding: 3, borderRadius: 999, borderWidth: 3, borderColor: 'transparent' },
    ringActive: { borderColor: c.primary },
    name: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, textAlign: 'center', color: c.mutedForeground },
    nameActive: { fontFamily: fonts.bodyBold, color: c.foreground },
  });
