import { File, Paths } from 'expo-file-system';

// Quran and prayer data are too large for AsyncStorage's quota, so they live as files.

function fileFor(key: string): File {
  return new File(Paths.document, `cache-${key}.json`);
}

export async function readCache<T>(key: string): Promise<T | null> {
  const file = fileFor(key);
  if (!file.exists) return null;
  return JSON.parse(await file.text()) as T;
}

export function writeCache(key: string, value: unknown): void {
  const file = fileFor(key);
  if (!file.exists) file.create();
  file.write(JSON.stringify(value));
}

/** Returns the cached copy when present; otherwise fetches, stores and returns it. */
export async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = await readCache<T>(key);
  if (hit !== null) return hit;
  const fresh = await load();
  writeCache(key, fresh);
  return fresh;
}
