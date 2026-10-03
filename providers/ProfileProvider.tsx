import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isGender, type Gender } from '@/domain/profile';

const GENDER_KEY = 'amalify.gender.v1';

type ProfileState = {
  /** null sampai user memilih di onboarding. */
  gender: Gender | null;
  /** True setelah storage dibaca. */
  loaded: boolean;
  isMale: boolean;
  /** Gender efektif untuk render: pilihan user, atau perempuan sebelum memilih. */
  effective: Gender;
  setGender: (next: Gender) => void;
};

const ProfileContext = createContext<ProfileState | null>(null);

/** Gender pemilik perangkat; tersimpan lokal seperti tema, tidak ikut sync Drive. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [gender, setGenderState] = useState<Gender | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(GENDER_KEY).then((g) => {
      if (g && isGender(g)) setGenderState(g);
      setLoaded(true);
    });
  }, []);

  const setGender = useCallback((next: Gender) => {
    setGenderState(next);
    AsyncStorage.setItem(GENDER_KEY, next);
  }, []);

  const value = useMemo<ProfileState>(() => {
    const effective: Gender = gender ?? 'perempuan';
    return {
      gender,
      loaded,
      isMale: loaded && effective === 'laki-laki',
      effective,
      setGender,
    };
  }, [gender, loaded, setGender]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileState {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
