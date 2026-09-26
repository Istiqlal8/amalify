import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { SURAH_NAMES } from '@/domain/murottal';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { DownloadButton } from './DownloadButton';

type Props = {
  surah: number;
  active: boolean;
  downloaded: boolean;
  progress: number | undefined;
  onPress: (surah: number) => void;
  onDownload: (surah: number) => void;
  onRemove: (surah: number) => void;
};

/** One surah in the tracklist; the one now loaded is tinted and marked with a speaker. */
export const SurahTrackRow = memo(function SurahTrackRow(props: Props) {
  const { surah, active, downloaded, progress, onPress, onDownload, onRemove } = props;
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { name, ayat } = SURAH_NAMES[surah - 1];
  return (
    <Pressable
      onPress={() => onPress(surah)}
      accessibilityRole="button"
      accessibilityLabel={`Putar ${name}`}
      android_ripple={{ color: colors.muted }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.num}>
        {active ? (
          <SymbolView name={{ ios: 'speaker.wave.2.fill', android: 'graphic_eq', web: 'graphic_eq' }} tintColor={colors.primary} size={20} />
        ) : (
          <Txt variant="caption">{surah}</Txt>
        )}
      </View>
      <View style={styles.flex}>
        <Txt numberOfLines={1} style={[styles.name, active && { color: colors.primary }]}>
          {name}
        </Txt>
        <Txt variant="caption">{ayat} ayat</Txt>
      </View>
      <DownloadButton
        name={name}
        downloaded={downloaded}
        progress={progress}
        onDownload={() => onDownload(surah)}
        onRemove={() => onRemove(surah)}
      />
    </Pressable>
  );
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, borderRadius: radius.sm },
    pressed: { opacity: 0.6 },
    num: { width: 32, alignItems: 'center' },
    flex: { flex: 1 },
    name: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22, color: c.foreground },
  });
