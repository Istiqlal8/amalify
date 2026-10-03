import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MenuTile } from '@/components/home/MenuTile';
import { Avatar } from '@/components/ui/Avatar';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyRole } from '@/hooks/useMyRole';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { clearGroupLogo, setGroupLogo } from '@/services/groupLogoService';
import { type Group, renameGroup } from '@/services/groupService';
import { supabase } from '@/services/supabase';

import { GroupAnnouncement } from './GroupAnnouncement';
import { GroupEditDialog } from './GroupEditDialog';

type Props = { group: Group; today: string; initiallyOpen: boolean; onChanged: () => void };

/** Logo, name and member count; tapping opens the group's menus. */
export function GroupCard({ group, today, initiallyOpen, onChanged }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const members = useMembersToday(group.id, today);
  const me = useMyUserId();
  const { isAdmin } = useMyRole(members, me);

  /** Closes the editor, runs one admin change, then reloads the groups. */
  async function change(task: (db: NonNullable<typeof supabase>) => Promise<unknown>) {
    setEditOpen(false);
    if (!supabase) return;
    setError(null);
    try {
      await task(supabase);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function changeLogo() {
    setEditOpen(false);
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    const asset = picked.canceled ? null : picked.assets[0];
    if (asset) change((db) => setGroupLogo(db, group.id, asset.uri, asset.mimeType ?? 'image/jpeg'));
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.head}>
        <Pressable
          disabled={!isAdmin}
          onPress={() => setEditOpen(true)}
          accessibilityRole={isAdmin ? 'button' : undefined}
          accessibilityLabel={isAdmin ? 'Ubah grup' : undefined}
          hitSlop={4}
        >
          <Avatar name={group.name} url={group.logo_url} size={52} />
        </Pressable>
        <View style={styles.flex}>
          <Txt variant="heading" numberOfLines={1}>{group.name}</Txt>
          <Txt variant="caption">{members.length} anggota</Txt>
        </View>
        <SymbolView
          name={open ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' } : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={colors.primaryDeep}
          size={24}
        />
      </Pressable>
      <GroupAnnouncement group={group} isAdmin={isAdmin} open={open} onChanged={onChanged} onError={setError} />
      {open && (
        <View style={styles.tiles}>
          <MenuTile href={{ pathname: '/anggota', params: { group: group.id } }} label="Anggota" icon={{ ios: 'person.2.fill', android: 'group', web: 'group' }} />
          <MenuTile href={{ pathname: '/report', params: { group: group.id } }} label="Report" icon={{ ios: 'doc.text.fill', android: 'assignment', web: 'assignment' }} />
          <MenuTile href={{ pathname: '/event', params: { group: group.id } }} label="Event" icon={{ ios: 'calendar', android: 'event', web: 'event' }} />
          <MenuTile href={{ pathname: '/kas', params: { group: group.id } }} label="Kas grup" icon={{ ios: 'banknote.fill', android: 'payments', web: 'payments' }} />
          <MenuTile href={{ pathname: '/group-farm', params: { group: group.id } }} label="Kebun grup" icon={{ ios: 'leaf', android: 'yard', web: 'yard' }} />
          <MenuTile href={{ pathname: '/catatan', params: { group: group.id } }} label="Catatan" icon={{ ios: 'note.text', android: 'sticky_note_2', web: 'sticky_note_2' }} />
          <MenuTile href={{ pathname: '/amalan-grup', params: { group: group.id } }} label="Amalan grup" icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }} />
          {isAdmin && (
            <MenuTile href={{ pathname: '/pantau', params: { group: group.id } }} label="Pantau" icon={{ ios: 'chart.bar.fill', android: 'monitoring', web: 'monitoring' }} />
          )}
        </View>
      )}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      {editOpen && (
        <GroupEditDialog
          name={group.name}
          url={group.logo_url}
          onRename={(name) => change((db) => renameGroup(db, group.id, name))}
          onChangeLogo={changeLogo}
          onRemoveLogo={() => change((db) => clearGroupLogo(db, group.id))}
          onClose={() => setEditOpen(false)}
        />
      )}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    head: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52 },
    flex: { flex: 1 },
    tiles: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm },
  });
