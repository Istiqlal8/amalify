import { useEffect, useState } from 'react';

import { supabase } from '@/services/supabase';

/** The signed-in Supabase user id, or null. */
export function useMyUserId(): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setId(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setId(session?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return id;
}
