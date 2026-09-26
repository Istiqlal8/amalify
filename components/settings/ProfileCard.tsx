import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { Profile } from '@/services/profileService';

/** Name, photo, bio and leaderboard visibility, as group mates see them. */
export function ProfileCard() {
  const state = useProfile();
  if (!state.profile) return null;
  // Remount the form when the saved profile changes so its fields start from the stored values.
  return <ProfileForm key={JSON.stringify(state.profile)} {...state} profile={state.profile} />;
}

type FormProps = Omit<ReturnType<typeof useProfile>, 'profile'> & { profile: Profile };

function ProfileForm({ profile, busy, error, save, pickAvatar }: FormProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [name, setName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [hideGlobal, setHideGlobal] = useState(profile.hideGlobal);

  const dirty = name !== profile.displayName || bio !== (profile.bio ?? '') || hideGlobal !== profile.hideGlobal;
  const valid = name.trim().length > 0;

  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel="Ganti foto" onPress={pickAvatar} disabled={busy} style={styles.photo}>
        <Avatar name={name} url={profile.avatarUrl} size={88} />
        {busy ? <ActivityIndicator color={colors.primary} /> : <Txt style={styles.link}>Ganti foto</Txt>}
      </Pressable>
      <TextField label="Nama" value={name} onChangeText={setName} maxLength={60} />
      <TextField label="Bio" value={bio} onChangeText={setBio} maxLength={80} placeholder="Opsional" />
      <View style={styles.row}>
        <Txt variant="bold" style={styles.flex}>Tampil di leaderboard global</Txt>
        <Switch
          accessibilityLabel="Tampil di leaderboard global"
          value={!hideGlobal}
          onValueChange={(v) => setHideGlobal(!v)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </View>
      <ClayButton
        label="Simpan"
        disabled={!dirty || !valid || busy}
        onPress={() => save({ displayName: name, bio, hideGlobal })}
      />
      {error && <Txt style={styles.error}>{error}</Txt>}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.md },
    photo: { alignItems: 'center', gap: space.sm, minHeight: 44 },
    link: { color: c.primaryDeep },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    flex: { flex: 1 },
    error: { color: c.destructive },
  });
