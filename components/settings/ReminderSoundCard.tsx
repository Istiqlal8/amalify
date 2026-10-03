import { createAudioPlayer } from 'expo-audio';
import { useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { REMINDER_SOUNDS } from '@/domain/reminderSound';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { useReminders } from '@/providers/ReminderProvider';
import { openReminderSoundSettings } from '@/services/notifications';

const PREVIEWS = {
  lembut: require('@/assets/sounds/notif/lembut.wav'),
  ceria: require('@/assets/sounds/notif/ceria.wav'),
} as const;

export function ReminderSoundCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { sound, setSound } = useReminders();
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  function preview(id: 'lembut' | 'ceria') {
    try {
      playerRef.current?.remove();
    } catch {
      // previous player already gone
    }
    const player = createAudioPlayer(PREVIEWS[id]);
    playerRef.current = player;
    player.play();
  }

  return (
    <View style={styles.card}>
      <Txt variant="bold">Bunyi pengingat</Txt>
      <Txt variant="caption">Berlaku untuk pengingat amalan, pengingat malam, dan adzan.</Txt>
      <View style={styles.list}>
        {REMINDER_SOUNDS.map((s) => {
          const active = s.id === sound;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`Bunyi ${s.label}`}
              onPress={() => void setSound(s.id)}
              style={[styles.option, active && styles.active]}>
              <View style={[styles.dot, active && styles.dotActive]} />
              <View style={styles.flex}>
                <Txt variant="bold">{s.label}</Txt>
                <Txt variant="caption">{s.caption}</Txt>
              </View>
              {typeof s.file === 'string' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Dengar contoh ${s.label}`}
                  onPress={() => preview(s.id as 'lembut' | 'ceria')}
                  style={styles.listen}>
                  <Txt style={{ color: colors.primaryDeep }}>Dengar</Txt>
                </Pressable>
              )}
            </Pressable>
          );
        })}
      </View>
      {Platform.OS === 'android' && (
        <>
          <Txt variant="caption">Mau pakai nada dering sendiri? Buka pengaturan channel Android lalu pilih Suara.</Txt>
          <ClayButton label="Atur nada dering sendiri" tone="soft" onPress={() => void openReminderSoundSettings(sound)} />
        </>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    list: { gap: space.sm },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      minHeight: 56,
      paddingHorizontal: space.sm,
      paddingVertical: space.sm,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    active: { borderColor: c.primary, backgroundColor: c.muted },
    dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: c.border },
    dotActive: { borderColor: c.primary, backgroundColor: c.primary },
    flex: { flex: 1, gap: 2 },
    listen: { paddingHorizontal: space.sm, paddingVertical: space.xs, minHeight: 40, justifyContent: 'center' },
  });
