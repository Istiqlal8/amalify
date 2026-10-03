import type { SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** Expo mints a token only against the EAS project this build belongs to. */
function projectId(): string | undefined {
  const eas = Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined;
  return eas?.projectId;
}

/** Null on the web, on a simulator, or while notifications are still unanswered. */
async function currentToken(): Promise<string | null> {
  const id = projectId();
  if (Platform.OS === 'web' || !id) return null;
  if (!(await Notifications.getPermissionsAsync()).granted) return null;
  return (await Notifications.getExpoPushTokenAsync({ projectId: id })).data;
}

/** Keeps this device reachable for group pushes; a device may hold several over time. */
export async function registerPushToken(db: SupabaseClient): Promise<void> {
  const token = await currentToken();
  if (!token) return;
  await db.from('push_tokens').upsert({ token, updated_at: new Date().toISOString() }, { onConflict: 'user_id,token' });
}

/** Signing out should stop the pushes, so the row goes with the session. */
export async function forgetPushToken(db: SupabaseClient): Promise<void> {
  const token = await currentToken();
  if (!token) return;
  await db.from('push_tokens').delete().eq('token', token);
}
