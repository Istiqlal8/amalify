import { Pressable, Share, StyleSheet, View } from 'react-native';

import { PlantArt } from '@/components/plant/PlantArt';
import { Avatar } from '@/components/ui/Avatar';
import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { type Palette, space } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';
import { useLogs } from '@/providers/LogsProvider';
import { useStyles } from '@/hooks/useStyles';
import { isTree } from '@/domain/flowers';
import { ROLE_LABELS } from '@/domain/groupRole';
import { stageFromPercent, stageName } from '@/domain/plantStage';
import type { Group, MemberToday } from '@/services/groupService';

/** `onPressMember` is set only for admins, who manage members from here. */
type Props = { group: Group; members: MemberToday[]; onPressMember?: (member: MemberToday) => void };

/** The invite button, then each member with today's plant and progress. */
export function MemberGarden({ group, members, onPressMember }: Props) {
  const { flowerFor } = useTheme();
  const { today } = useLogs();
  const flower = flowerFor(today);
  const styles = useStyles(makeStyles);
  function invite() {
    Share.share({ message: `Yuk tanam kebaikan bareng di grup "${group.name}" Amalify. Kode: ${group.invite_code}` });
  }

  return (
    <View style={styles.body}>
      <ClayButton label="Tambah anggota" onPress={invite} />
      <Txt variant="caption" style={styles.center}>
        Bagikan kode undangan {group.invite_code}
      </Txt>
      {members.map((m) => {
        const stage = stageFromPercent(m.percent);
        return (
          <Pressable
            key={m.userId}
            style={styles.row}
            disabled={!onPressMember}
            onPress={() => onPressMember?.(m)}
            accessibilityRole={onPressMember ? 'button' : undefined}
            accessibilityLabel={`${m.name}${m.role === 'member' ? '' : `, ${ROLE_LABELS[m.role]}`}, ${m.hidden ? 'progres disembunyikan' : `${stageName(stage, isTree(flower))}, ${m.percent}%`}`}
          >
            <PlantArt stage={stage} size={48} />
            <Avatar name={m.name} url={m.avatarUrl} />
            <View style={styles.flex}>
              <Txt variant="bold">{m.name}{m.role !== 'member' && <Txt variant="caption"> · {ROLE_LABELS[m.role]}</Txt>}</Txt>
              {m.bio && <Txt variant="caption" numberOfLines={1}>{m.bio}</Txt>}
              <Txt variant="caption">{m.hidden ? 'Progres disembunyikan' : stageName(stage, isTree(flower))}</Txt>
            </View>
            <Txt variant="bold">{m.hidden ? '—' : `${m.percent}%`}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    body: { gap: space.md },
    center: { textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    flex: { flex: 1 },
  });
