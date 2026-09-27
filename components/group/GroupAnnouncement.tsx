import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { type Group, setAnnouncement } from '@/services/groupService';
import { supabase } from '@/services/supabase';

import { AnnouncementDialog } from './AnnouncementDialog';

type Props = { group: Group; isAdmin: boolean; open: boolean; onChanged: () => void; onError: (message: string) => void };

/** The pinned announcement, always visible; admins tap it (or the button, when open) to edit. */
export function GroupAnnouncement({ group, isAdmin, open, onChanged, onError }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);

  async function save(message: string) {
    setEditing(false);
    if (!supabase) return;
    try {
      await setAnnouncement(supabase, group.id, message);
      onChanged();
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      {group.announcement ? (
        <Pressable
          disabled={!isAdmin}
          onPress={() => setEditing(true)}
          accessibilityRole={isAdmin ? 'button' : undefined}
          accessibilityLabel={`Pengumuman: ${group.announcement}`}
          style={styles.box}
        >
          <SymbolView name={{ ios: 'megaphone.fill', android: 'campaign', web: 'campaign' }} tintColor={colors.primaryDeep} size={20} />
          <Txt style={styles.flex}>{group.announcement}</Txt>
        </Pressable>
      ) : (
        isAdmin && open && <ClayButton label="Tulis pengumuman" tone="soft" onPress={() => setEditing(true)} />
      )}
      {editing && <AnnouncementDialog initial={group.announcement} onSave={save} onClose={() => setEditing(false)} />}
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    box: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.sm, borderRadius: radius.md, backgroundColor: c.muted },
    flex: { flex: 1 },
  });
