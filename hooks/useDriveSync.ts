import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { googleTokens } from '@/services/googleAuth';
import { downloadFile, uploadFile, type DriveFile } from '@/storage/driveStore';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

/** Manual trigger: pulls, merges, then pushes. Resolves false when offline or when it fails. */
export type SyncNow = () => Promise<boolean>;

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
): { status: SyncStatus; syncNow: SyncNow; lastSynced: number | null } {
  const [status, setStatus] = useState<SyncStatus>('offline');
  const [pulled, setPulled] = useState(false);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const fileId = useRef<string | null>(null);
  // Manual syncs run outside the render cycle, so they read the newest snapshot from here.
  const latest = useRef({ local, applyRemote });
  useEffect(() => {
    latest.current = { local, applyRemote };
  });

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
        setLastSynced(Date.now());
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

  const syncNow = useCallback(async (): Promise<boolean> => {
    if (!signedIn || !loaded) return false;
    setStatus('syncing');
    try {
      const { accessToken } = await googleTokens();
      const remote = await downloadFile(accessToken);
      fileId.current = remote.fileId;
      latest.current.applyRemote(remote.file);
      setPulled(true);
      // Merges are union/newer-wins, so pushing the pre-merge snapshot is safe;
      // the debounced push follows up with the merged copy a moment later.
      const { accessToken: uploadToken } = await googleTokens();
      fileId.current = await uploadFile(uploadToken, fileId.current, latest.current.local);
      setStatus('synced');
      setLastSynced(Date.now());
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  }, [signedIn, loaded]);

  return { status, syncNow, lastSynced };
}
