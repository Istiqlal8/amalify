import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/providers/AuthProvider';
import { getProfile, updateProfile, uploadAvatar, type Profile, type ProfileEdit } from '@/services/profileService';
import { supabase } from '@/services/supabase';

type ProfileState = {
  profile: Profile | null;
  busy: boolean;
  error: string | null;
  save: (edit: ProfileEdit) => Promise<boolean>;
  pickAvatar: () => Promise<void>;
};

const message = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** The signed-in user's group profile; null until groups are connected. */
export function useProfile(): ProfileState {
  const { groupsReady } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !groupsReady) return setProfile(null);
    getProfile(supabase).then(setProfile).catch((e) => setError(message(e)));
  }, [groupsReady]);

  const run = useCallback(async (task: () => Promise<void>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await task();
      return true;
    } catch (e) {
      setError(message(e));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const save = useCallback(
    (edit: ProfileEdit) =>
      run(async () => {
        if (!supabase) return;
        await updateProfile(supabase, edit);
        setProfile((p) => (p ? { ...p, ...edit } : p));
      }),
    [run],
  );

  const pickAvatar = useCallback(async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    const asset = picked.canceled ? null : picked.assets[0];
    if (!asset || !supabase) return;
    const db = supabase;
    await run(async () => {
      const url = await uploadAvatar(db, asset.uri, asset.mimeType ?? 'image/jpeg');
      setProfile((p) => (p ? { ...p, avatarUrl: url } : p));
    });
  }, [run]);

  return { profile, busy, error, save, pickAvatar };
}
