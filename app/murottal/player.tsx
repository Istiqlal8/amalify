import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AyahNow } from '@/components/murottal/AyahNow';
import { PlayerControls } from '@/components/murottal/PlayerControls';
import { ReciterAvatar } from '@/components/murottal/ReciterAvatar';
import { SceneBackground } from '@/components/murottal/SceneBackground';
import { ScenePicker } from '@/components/murottal/ScenePicker';
import { SeekBar } from '@/components/murottal/SeekBar';
import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { SURAH_NAMES } from '@/domain/murottal';
import { useCurrentAyah } from '@/hooks/useCurrentAyah';
import { useSceneChoice } from '@/hooks/useSceneChoice';
import { useMurottal, useMurottalStatus } from '@/providers/MurottalProvider';

const WHITE = '#FFFFFF';
const SOFT = { color: 'rgba(255, 255, 255, 0.75)' };

export default function PlayerScreen() {
  const { width } = useWindowDimensions();
  const { reciter, surah } = useMurottal();
  const { error } = useMurottalStatus();
  const { scene, setScene } = useSceneChoice();
  const [picking, setPicking] = useState(false);
  const ayahNow = useCurrentAyah(reciter, surah);
  const current = surah ?? 1;
  const { name, ayat } = SURAH_NAMES[current - 1];

  return (
    <View style={styles.root}>
      <SceneBackground scene={scene} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <IconButton icon={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }} label="Tutup" onPress={() => router.back()} />
          <Txt variant="caption" style={SOFT}>{reciter.style ?? 'Murottal'}</Txt>
          <IconButton icon={{ ios: 'photo.on.rectangle', android: 'wallpaper', web: 'wallpaper' }} label="Ganti latar" onPress={() => setPicking(true)} />
        </View>
        <View style={styles.art}>
          {ayahNow ? <AyahNow ayah={ayahNow} /> : (
            <View style={styles.centered}>
              <ReciterAvatar reciter={reciter} size={Math.min(width * 0.62, 280)} square />
            </View>
          )}
        </View>
        <View style={styles.info}>
          {ayahNow && <ReciterAvatar reciter={reciter} size={48} square />}
          <View style={styles.flex}>
            <Txt variant="title" numberOfLines={1} style={styles.title}>{name}</Txt>
            <Txt variant="caption" numberOfLines={1} style={SOFT}>{reciter.name} · {ayat} ayat</Txt>
          </View>
          <IconButton
            icon={{ ios: 'book', android: 'menu_book', web: 'menu_book' }}
            label="Baca surah ini"
            onPress={() => router.push({ pathname: '/quran/[nomor]', params: { nomor: current } })}
          />
        </View>
        {error && <Txt style={styles.error}>Gagal memutar. Periksa koneksi internet.</Txt>}
        <SeekBar light />
        <PlayerControls light />
      </SafeAreaView>
      <ScenePicker visible={picking} value={scene} onPick={setScene} onClose={() => setPicking(false)} />
    </View>
  );
}

function IconButton({ icon, label, onPress }: { icon: SymbolViewProps['name']; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={12} style={styles.icon}>
      <SymbolView name={icon} tintColor={WHITE} size={28} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0C' },
  safe: { flex: 1, paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: space.sm },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  // Stretch so a long ayah can scroll full width; `alignSelf` below re-centres the photo.
  art: { flex: 1, justifyContent: 'center', alignItems: 'stretch' },
  centered: { alignSelf: 'center' },
  info: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  title: { color: WHITE },
  error: { color: '#FCA5A5' },
});
