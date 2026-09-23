import { Share, StyleSheet, View } from 'react-native';

import { PlantArt } from '@/components/plant/PlantArt';
import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';
import { useStyles } from '@/hooks/useStyles';
import { isTree } from '@/domain/flowers';
import { stageFromPercent, stageName } from '@/domain/plantStage';
import type { Group, MemberToday } from '@/services/groupService';

type Props = { group: Group; members: MemberToday[] };

export function MemberGarden({ group, members }: Props) {
  const { colors, flower } = useTheme();
  const styles = useStyles(makeStyles);
  function invite() {
    Share.share({ message: `Yuk tanam kebaikan bareng di grup "${group.name}" Amalify. Kode: ${group.invite_code}` });
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <View style={styles.head}>
        <Txt variant="heading">{group.name}</Txt>
        <Txt variant="caption">Kode {group.invite_code}</Txt>
      </View>
      {members.map((m) => {
        const stage = stageFromPercent(m.percent);
        return (
          <View key={m.userId} style={styles.row} accessible accessibilityLabel={`${m.name}, ${stageName(stage, isTree(flower))}, ${m.percent}%`}>
            <PlantArt stage={stage} size={48} />
            <View style={styles.flex}>
              <Txt variant="bold">{m.name}</Txt>
              <Txt variant="caption">{stageName(stage, isTree(flower))}</Txt>
            </View>
            <Txt variant="bold">{m.percent}%</Txt>
          </View>
        );
      })}
      <ClayButton label="Undang teman" tone="soft" onPress={invite} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm },
    head: { gap: 2, marginBottom: space.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    flex: { flex: 1 },
  });
