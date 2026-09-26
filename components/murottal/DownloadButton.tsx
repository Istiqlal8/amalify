import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

type Props = {
  name: string;
  downloaded: boolean;
  /** Fraction done while downloading; undefined when idle. */
  progress: number | undefined;
  onDownload: () => void;
  onRemove: () => void;
};

/** Download arrow, then a percentage while saving, then a check that offers to delete. */
export function DownloadButton({ name, downloaded, progress, onDownload, onRemove }: Props) {
  const { colors } = useTheme();

  if (progress !== undefined) {
    return (
      <Txt style={[styles.percent, { color: colors.primary }]} accessibilityLabel={`Mengunduh ${name}`}>
        {Math.round(progress * 100)}%
      </Txt>
    );
  }

  const confirmRemove = () =>
    Alert.alert(`Hapus unduhan ${name}?`, 'Surah ini akan diputar lewat internet lagi.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: onRemove },
    ]);

  return (
    <Pressable
      onPress={downloaded ? confirmRemove : onDownload}
      accessibilityRole="button"
      accessibilityLabel={downloaded ? `Hapus unduhan ${name}` : `Unduh ${name}`}
      hitSlop={8}
      style={styles.button}>
      <SymbolView
        name={
          downloaded
            ? { ios: 'checkmark.circle.fill', android: 'download_done', web: 'download_done' }
            : { ios: 'arrow.down.circle', android: 'download', web: 'download' }
        }
        tintColor={downloaded ? colors.primary : colors.mutedForeground}
        size={24}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  percent: { width: 44, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 44 },
});
