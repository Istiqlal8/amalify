import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { SURAHS } from '@/domain/tilawah';
import { useAyahAudio } from '@/hooks/useAyahAudio';
import { useSurah } from '@/hooks/useQuran';
import { useStyles } from '@/hooks/useStyles';

import { AyahPlayButton } from './AyahPlayButton';
import { TafsirPanel } from './TafsirPanel';

type Props = { surah: number; ayah: number; onClose: () => void };

/** Bottom sheet for a tapped mushaf ayah: its meaning, recitation and tafsir. */
export function AyahSheet({ surah, ayah, onClose }: Props) {
  const styles = useStyles(makeStyles);
  const { data } = useSurah(surah);
  const audio = useAyahAudio(surah, SURAHS[surah - 1].ayat);
  const arti = data?.ayat[ayah - 1]?.arti;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Tutup" />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.grip} />
        <Txt variant="heading">
          {SURAHS[surah - 1].name} · Ayat {ayah}
        </Txt>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Txt>{arti ?? 'Memuat…'}</Txt>
          <TafsirPanel
            surah={surah}
            ayat={ayah}
            leading={<AyahPlayButton playing={audio.playing !== null} onPress={() => audio.toggle(audio.playing ?? ayah)} />}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    sheet: {
      maxHeight: '70%',
      padding: space.md,
      gap: space.sm,
      backgroundColor: c.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
    },
    grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.border },
    body: { flexGrow: 0 },
    bodyContent: { gap: space.sm, paddingBottom: space.md },
  });
