import type { User } from '@react-native-google-signin/google-signin';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { configureGoogle, googleTokens, restoreGoogle, signInGoogle, signOutGoogle } from '@/services/googleAuth';
import { signInSupabase } from '@/services/groupService';
import { supabase } from '@/services/supabase';

type AuthState = {
  user: User | null;
  groupsReady: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function connectGroups(user: User): Promise<boolean> {
  if (!supabase) return false;
  const { idToken } = await googleTokens();
  await signInSupabase(supabase, idToken, user.user.name ?? user.user.email);
  return true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [groupsReady, setGroupsReady] = useState(false);

  const adopt = useCallback(async (next: User | null) => {
    setUser(next);
    setGroupsReady(next ? await connectGroups(next).catch(() => false) : false);
  }, []);

  useEffect(() => {
    configureGoogle();
    restoreGoogle().then(adopt).catch(() => adopt(null));
  }, [adopt]);

  const signIn = useCallback(async () => adopt(await signInGoogle()), [adopt]);

  const signOut = useCallback(async () => {
    await signOutGoogle();
    await supabase?.auth.signOut();
    await adopt(null);
  }, [adopt]);

  const value = useMemo(() => ({ user, groupsReady, signIn, signOut }), [user, groupsReady, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
