import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { PickerSheet } from '@/components/ui/PickerSheet';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { MemberToday } from '@/services/groupService';

export const NO_PIC = '';
const NO_PIC_LABEL = 'Belum ada';

/** Drops a PIC who has left the group, so the field shows who will actually be saved. */
export function seedPic(members: MemberToday[], pic: string | null | undefined): string {
  return pic && members.some((m) => m.userId === pic) ? pic : NO_PIC;
}

type Props = { members: MemberToday[]; value: string; onChange: (pic: string) => void };

/** Shows the chosen PIC; tapping opens a searchable list, since a halaqoh can hold dozens of names. */
export function PicField({ members, value, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const options = [{ id: NO_PIC, label: NO_PIC_LABEL }, ...members.map((m) => ({ id: m.userId, label: m.name }))];
  const chosen = options.find((o) => o.id === value) ?? options[0];

  function pick(id: string) {
    setOpen(false);
    onChange(id);
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={`PIC, ${chosen.label}`} onPress={() => setOpen(true)} style={styles.field}>
        <Txt variant="bold" numberOfLines={1} style={{ color: colors.primaryDeep }}>
          {chosen.label}
        </Txt>
      </Pressable>
      {open && (
        <PickerSheet title="Pilih PIC" options={options} value={value} onPick={pick} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    field: {
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
  });
