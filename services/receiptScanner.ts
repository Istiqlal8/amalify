import { requireOptionalNativeModule } from 'expo';
import * as ImagePicker from 'expo-image-picker';

type TextExtractor = { isSupported: boolean; extractTextFromImage: (path: string) => Promise<string[]> };

/**
 * Looked up by name instead of importing `expo-text-extractor`, whose entry file throws when the
 * native half is missing. An over-the-air update can reach an install built before the module
 * was added; there the scan must fail with a message, not take the screen down on import.
 */
const extractor = requireOptionalNativeModule<TextExtractor>('ExpoTextExtractor');

export type ReceiptSource = 'camera' | 'gallery';

const OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };

async function photograph(): Promise<ImagePicker.ImagePickerResult> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('Izin kamera ditolak. Aktifkan di Pengaturan HP untuk Amalify.');
  return ImagePicker.launchCameraAsync(OPTIONS);
}

/** Reads a receipt from a new photo or a saved image; null when the user backs out of the picker. */
export async function scanReceipt(source: ReceiptSource): Promise<string[] | null> {
  if (!extractor?.isSupported) throw new Error('Baca nota belum tersedia. Perbarui Amalify dari Play Store.');
  const shot = source === 'camera' ? await photograph() : await ImagePicker.launchImageLibraryAsync(OPTIONS);
  if (shot.canceled) return null;
  // The native side takes a plain path.
  return extractor.extractTextFromImage(shot.assets[0].uri.replace('file://', ''));
}
