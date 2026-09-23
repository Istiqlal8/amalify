import { useEffect, useRef, useState } from 'react';

import { googleTokens } from '@/services/googleAuth';
import { downloadFile, uploadFile, type DriveFile } from '@/storage/driveStore';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

const UPLOAD_DELAY_MS = 3000;

/**
 * Pulls the Drive copy once per sign-in and hands it to `applyRemote` to merge; only after that
 * pull finishes are local edits pushed, so a fresh device never overwrites (or duplicates) the
 * file it has not read yet.
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

  return status;
}
