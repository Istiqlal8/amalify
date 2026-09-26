export type Picked = { uri: string; mimeType: string };

// Avatars and group logos never show larger than about 100 pt, so 256 px is sharp even at 3x.
const SIZE = 256;
const QUALITY = 0.8;

/**
 * Scales a picked photo down to a 256 px JPEG (about 20 KB) before upload, instead of sending the
 * camera original (often 0.5–1 MB), to save Supabase storage and download quota. Falls back to the
 * original when the native module is missing, i.e. on a dev build made before it was added.
 */
export async function shrinkImage(picked: Picked): Promise<Picked> {
  try {
    const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');
    const rendered = await ImageManipulator.manipulate(picked.uri).resize({ width: SIZE, height: null }).renderAsync();
    const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY });
    return { uri: saved.uri, mimeType: 'image/jpeg' };
  } catch {
    return picked;
  }
}
