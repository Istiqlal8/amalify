import type { SupabaseClient } from '@supabase/supabase-js';
import { File } from 'expo-file-system';

export type Profile = {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  hideGlobal: boolean;
};

export type ProfileEdit = Pick<Profile, 'displayName' | 'bio' | 'hideGlobal'>;

type Row = { display_name: string; avatar_url: string | null; bio: string | null; hide_global: boolean };

const BUCKET = 'avatars';

async function myId(db: SupabaseClient): Promise<string> {
  const { data } = await db.auth.getUser();
  if (!data.user) throw new Error('Belum masuk');
  return data.user.id;
}

export async function getProfile(db: SupabaseClient): Promise<Profile> {
  const id = await myId(db);
  const { data, error } = await db
    .from('profiles')
    .select('display_name, avatar_url, bio, hide_global')
    .eq('id', id)
    .single<Row>();
  if (error) throw error;
  return { displayName: data.display_name, avatarUrl: data.avatar_url, bio: data.bio, hideGlobal: data.hide_global };
}

export async function updateProfile(db: SupabaseClient, edit: ProfileEdit): Promise<void> {
  const id = await myId(db);
  const bio = edit.bio?.trim() || null;
  const { error } = await db
    .from('profiles')
    .update({ display_name: edit.displayName.trim().slice(0, 60), bio, hide_global: edit.hideGlobal })
    .eq('id', id);
  if (error) throw error;
}

/** Uploads a picked image and points the profile at it; returns the new public URL. */
export async function uploadAvatar(db: SupabaseClient, uri: string, mimeType: string): Promise<string> {
  const id = await myId(db);
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const path = `${id}/${Date.now()}.${ext}`;
  const bytes = await new File(uri).arrayBuffer();
  const upload = await db.storage.from(BUCKET).upload(path, bytes, { contentType: mimeType });
  if (upload.error) throw upload.error;
  const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error } = await db.from('profiles').update({ avatar_url: url }).eq('id', id);
  if (error) throw error;
  await removeAvatars(db, id, path);
  return url;
}

/** Deletes the user's stored avatars, keeping `keep` when given. */
async function removeAvatars(db: SupabaseClient, id: string, keep?: string): Promise<void> {
  const { data } = await db.storage.from(BUCKET).list(id);
  const stale = (data ?? []).map((f) => `${id}/${f.name}`).filter((p) => p !== keep);
  if (stale.length > 0) await db.storage.from(BUCKET).remove(stale);
}

export async function deleteAccount(db: SupabaseClient): Promise<void> {
  const id = await myId(db);
  await removeAvatars(db, id);
  const { error } = await db.rpc('delete_account');
  if (error) throw error;
  await db.auth.signOut();
}
