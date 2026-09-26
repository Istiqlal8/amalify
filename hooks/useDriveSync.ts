import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { googleTokens } from '@/services/googleAuth';
import { downloadFile, uploadFile, type DriveFile } from '@/storage/driveStore';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

const UPLOAD_DELAY_MS = 3000;

/**
 * Pulls the Drive copy on sign-in and again whenever the app returns to the foreground, and hands
 * it to `applyRemote` to merge (newer entries win, so unsent local edits survive). Local edits are
 * pushed only after the first pull, so a fresh device never overwrites the file it has not read yet.
 */
export function useDriveSync(
  signedIn: boolean,
  loaded: boolean,
  local: DriveFile,
  applyRemote: (remote: DriveFile) => void,
): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>('offline');
  const [pulled, setPulled] = useState(false);
  const fileId = useRef<string | null>(null);

  useEffect(() => {
    if (!signedIn || !loaded) {
      setPulled(false);
      setStatus('offline');
      return;
    }
    setStatus('syncing');
    (async () => {
      const { accessToken } = await googleTokens();
      const remote = await downloadFile(accessToken);
      fileId.current = remote.fileId;
      applyRemote(remote.file);
      setPulled(true);
    })().catch(() => setStatus('error'));
  }, [signedIn, loaded, applyRemote]);

  useEffect(() => {
    if (!signedIn || !pulled) return;
    const timer = setTimeout(async () => {
      setStatus('syncing');
      try {
        const { accessToken } = await googleTokens();
        fileId.current = await uploadFile(accessToken, fileId.current, local);
        setStatus('synced');
      } catch {
        setStatus('error');
      }
    }, UPLOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [signedIn, pulled, local]);

  // Picks up edits made on another device while this one was in the background.
  useEffect(() => {
    if (!signedIn || !pulled) return;
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      try {
        const { accessToken } = await googleTokens();
        applyRemote((await downloadFile(accessToken)).file);
      } catch {
        setStatus('error');
      }
    });
    return () => sub.remove();
  }, [signedIn, pulled, applyRemote]);

  return status;
}
