import type { SupabaseClient } from '@supabase/supabase-js';
import { File } from 'expo-file-system';

const BUCKET = 'group-logos';

/** Uploads a picked image as the group's logo (creator only) and returns its public URL. */
export async function setGroupLogo(db: SupabaseClient, groupId: string, uri: string, mimeType: string): Promise<string> {
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const path = `${groupId}/${Date.now()}.${ext}`;
  const bytes = await new File(uri).arrayBuffer();
  const upload = await db.storage.from(BUCKET).upload(path, bytes, { contentType: mimeType });
  if (upload.error) throw upload.error;
  const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error } = await db.rpc('set_group_logo', { g: groupId, url });
  if (error) throw error;
  await removeFiles(db, groupId, path);
  return url;
}

/** Drops the logo, so the group shows its initial again. */
export async function clearGroupLogo(db: SupabaseClient, groupId: string): Promise<void> {
  const { error } = await db.rpc('set_group_logo', { g: groupId, url: null });
  if (error) throw error;
  await removeFiles(db, groupId);
}

/** Deletes the group's stored logos, keeping `keep` when given. */
async function removeFiles(db: SupabaseClient, groupId: string, keep?: string): Promise<void> {
  const { data } = await db.storage.from(BUCKET).list(groupId);
  const stale = (data ?? []).map((f) => `${groupId}/${f.name}`).filter((p) => p !== keep);
  if (stale.length > 0) await db.storage.from(BUCKET).remove(stale);
}
