import { migrateLogs, type Logs } from '@/domain/dayLog';
import type { HaidLog } from '@/domain/haid';
import type { Plan } from '@/domain/plan';
import type { Unlocks } from '@/domain/shop';

// Lives in the user's hidden app-data folder: private to this app, counted against their own Drive quota.
const FILE_NAME = 'amalify.json';
const API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

/** `plan` and `haid` are absent in files written before those existed. */
export type DriveFile = { logs: Logs; plan?: Plan; haid?: HaidLog; unlocks?: Unlocks };

async function driveFetch(token: string, url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!res.ok) throw new Error(`Drive ${res.status}: ${await res.text()}`);
  return res;
}

async function findFileId(token: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`);
  const res = await driveFetch(token, `${API}?spaces=appDataFolder&q=${q}&fields=files(id)`);
  const body = (await res.json()) as { files: { id: string }[] };
  return body.files[0]?.id ?? null;
}

export async function downloadFile(token: string): Promise<{ fileId: string | null; file: DriveFile }> {
  const fileId = await findFileId(token);
  if (!fileId) return { fileId: null, file: { logs: {} } };
  const res = await driveFetch(token, `${API}/${fileId}?alt=media`);
  const body = (await res.json()) as DriveFile;
  return { fileId, file: { logs: migrateLogs(body.logs ?? {}), plan: body.plan, haid: body.haid, unlocks: body.unlocks } };
}

export async function uploadFile(token: string, fileId: string | null, file: DriveFile): Promise<string> {
  const content = JSON.stringify(file);
  if (fileId) {
    await driveFetch(token, `${UPLOAD}/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: content,
    });
    return fileId;
  }
  return createFile(token, content);
}

async function createFile(token: string, content: string): Promise<string> {
  const boundary = 'amalify-boundary';
  const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] });
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n');
  const res = await driveFetch(token, `${UPLOAD}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  return ((await res.json()) as { id: string }).id;
}

/** Removes the app's Drive file, used when the user deletes their account. */
export async function deleteFile(token: string): Promise<void> {
  const fileId = await findFileId(token);
  if (fileId) await driveFetch(token, `${API}/${fileId}`, { method: 'DELETE' });
}
