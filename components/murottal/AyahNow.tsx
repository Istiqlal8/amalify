import { ScrollView, StyleSheet } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, space } from '@/constants/theme';
import type { Ayah } from '@/services/quranApi';

/** The ayah being recited, large, in white over the player backdrop. Long ayat scroll. */
export function AyahNow({ ayah }: { ayah: Ayah }) {
  return (
    <ScrollView key={ayah.nomor} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Txt style={styles.number}>Ayat {ayah.nomor}</Txt>
      <Txt style={styles.arab}>{ayah.arab}</Txt>
      <Txt style={styles.arti}>{ayah.arti}</Txt>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: space.md, paddingVertical: space.md },
  number: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 18, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' },
  arab: { fontFamily: fonts.arabic, fontSize: 30, lineHeight: 60, color: '#FFFFFF', textAlign: 'center', writingDirection: 'rtl' },
  arti: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center' },
});
