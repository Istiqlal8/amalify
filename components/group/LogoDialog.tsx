import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

type Props = { name: string; url: string | null; onChange: () => void; onRemove: () => void; onClose: () => void };

/** The group logo shown large, with Ganti (and Hapus once a photo is set). */
export function LogoDialog({ name, url, onChange, onRemove, onClose }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.center} onPress={onClose} accessibilityLabel="Tutup">
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.preview}>
            <Avatar name={name} url={url} size={200} />
            <Txt variant="heading">{name}</Txt>
          </View>
          <ClayButton label="Ganti" onPress={onChange} />
          {url && <ClayButton label="Hapus" tone="soft" onPress={onRemove} />}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', padding: space.lg, backgroundColor: 'rgba(0,0,0,0.55)' },
    preview: { alignItems: 'center', gap: space.sm },
    card: { alignItems: 'stretch', gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: c.card },
  });
