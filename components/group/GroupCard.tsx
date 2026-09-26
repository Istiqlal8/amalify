import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MenuTile } from '@/components/home/MenuTile';
import { Avatar } from '@/components/ui/Avatar';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { clearGroupLogo, setGroupLogo } from '@/services/groupLogoService';
import type { Group } from '@/services/groupService';
import { supabase } from '@/services/supabase';

import { LogoDialog } from './LogoDialog';

type Props = { group: Group; today: string; initiallyOpen: boolean; onChanged: () => void };

/** Logo, name and member count; tapping opens the group's menus. */
export function GroupCard({ group, today, initiallyOpen, onChanged }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  const [error, setError] = useState<string | null>(null);
  const [logoOpen, setLogoOpen] = useState(false);
  const members = useMembersToday(group.id, today);
  const isCreator = useMyUserId() === group.created_by;

  async function removeLogo() {
    setLogoOpen(false);
    if (!supabase) return;
    setError(null);
    try {
      await clearGroupLogo(supabase, group.id);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function changeLogo() {
    setLogoOpen(false);
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    const asset = picked.canceled ? null : picked.assets[0];
    if (!asset || !supabase) return;
    setError(null);
    try {
      await setGroupLogo(supabase, group.id, asset.uri, asset.mimeType ?? 'image/jpeg');
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.head}>
        <Pressable
          disabled={!isCreator}
          onPress={() => setLogoOpen(true)}
          accessibilityRole={isCreator ? 'button' : undefined}
          accessibilityLabel={isCreator ? 'Ganti logo grup' : undefined}
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
      {open && (
        <>
          <View style={styles.tiles}>
            <MenuTile href={{ pathname: '/anggota', params: { group: group.id } }} label="Anggota" icon={{ ios: 'person.2.fill', android: 'group', web: 'group' }} />
            <MenuTile href={{ pathname: '/report', params: { group: group.id } }} label="Report" icon={{ ios: 'doc.text.fill', android: 'assignment', web: 'assignment' }} />
            <MenuTile href={{ pathname: '/event', params: { group: group.id } }} label="Event" icon={{ ios: 'calendar', android: 'event', web: 'event' }} />
            <MenuTile href={{ pathname: '/kas', params: { group: group.id } }} label="Kas grup" icon={{ ios: 'banknote.fill', android: 'payments', web: 'payments' }} />
            <MenuTile href={{ pathname: '/group-farm', params: { group: group.id } }} label="Kebun grup" icon={{ ios: 'leaf', android: 'yard', web: 'yard' }} />
            <MenuTile href={{ pathname: '/catatan', params: { group: group.id } }} label="Catatan" icon={{ ios: 'note.text', android: 'sticky_note_2', web: 'sticky_note_2' }} />
          </View>
          {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
        </>
      )}
      {logoOpen && (
        <LogoDialog
          name={group.name}
          url={group.logo_url}
          onChange={changeLogo}
          onRemove={removeLogo}
          onClose={() => setLogoOpen(false)}
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
