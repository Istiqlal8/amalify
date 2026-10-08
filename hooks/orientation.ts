/**
 * Screen-orientation access that never crashes the app.
 *
 * `expo-screen-orientation` resolves its native module at import time and throws if the module is
 * missing — which is the case in Expo Go and in any build made before the package was added. Since
 * `app/_layout.tsx` and the garden both need it, a plain top-level import would take the whole app
 * down to the error boundary on those builds. Everything here is loaded lazily and every call is
 * swallowed on failure, so orientation simply does nothing instead of breaking the screen.
 */
type OrientationLock = number;

const PORTRAIT_UP = 3;

let loadWarned = false;

/** Returns the module, or null when it (or its native part) is unavailable. */
function load(): typeof import('expo-screen-orientation') | null {
  try {
    // Lazy require so a missing native module is a caught error, not a module-eval crash.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-screen-orientation') as typeof import('expo-screen-orientation');
  } catch (error) {
    if (!loadWarned) {
      loadWarned = true;
      console.warn('[orientation] expo-screen-orientation unavailable; orientation stays fixed.', error);
    }
    return null;
  }
}

/** Allow the current device to rotate freely (the garden uses this). */
export function unlockOrientation(): void {
  const mod = load();
  if (!mod) return;
  mod.unlockAsync().catch(() => {});
}

/** Force a specific lock, swallowing failures on devices that reject it. */
function lock(lock: OrientationLock): void {
  const mod = load();
  if (!mod) return;
  mod.lockAsync(lock).catch(() => {});
}

/** Lock back to upright portrait (every screen except the garden). */
export function lockPortrait(): void {
  lock(PORTRAIT_UP);
}