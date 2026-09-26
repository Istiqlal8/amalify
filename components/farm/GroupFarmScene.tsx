import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/constants/theme';
import { plotTile } from '@/domain/farm';
import { animalFor, buildGroupFarm, firstName, flowerFor, type MemberBed } from '@/domain/groupFarm';
import { useFarmPresence } from '@/hooks/useFarmPresence';
import { useTheme } from '@/providers/ThemeProvider';
import type { MemberToday } from '@/services/groupService';

import { BedTile } from './BedTile';
import { FarmStage } from './FarmStage';
import { SCENE_GROUP } from './farmSprites';
import { RemotePlayer } from './RemotePlayer';
import { useMotion } from './Walker';

type Props = { groupId: string; members: MemberToday[]; userId: string; name: string };

const captionOf = (bed: MemberBed) => `${bed.name} · ${bed.percent}%`;

/** Shared farm: one bed per member for today, and every member on the farm right now walking around. */
export function GroupFarmScene({ groupId, members, userId, name }: Props) {
  const [near, setNear] = useState(-1);
  const motion = useMotion();
  const { flower } = useTheme();
  const players = useFarmPresence(groupId, userId, name, motion);
  const bottom = useSafeAreaInsets().bottom + space.md;
  const beds = buildGroupFarm(members);
  const current = beds[near];

  return (
    <FarmStage
      scene={SCENE_GROUP}
      top={0}
      bottom={bottom}
      caption={current ? captionOf(current) : null}
      motion={motion}
      animal={animalFor(userId)}
      onNearPlot={setNear}>
      {(cell) => (
        <>
          {beds.map((bed, i) => (
            <BedTile
              key={bed.userId}
              x={plotTile(bed).x}
              y={plotTile(bed).y}
              cell={cell}
              flower={bed.userId === userId ? flower : flowerFor(bed.userId)}
              stage={bed.stage}
              drawBed
              label={captionOf(bed)}
              highlight={bed.userId === userId}
              active={i === near}
              name={firstName(bed.name)}
            />
          ))}
          {Object.values(players).map((p) => (
            <RemotePlayer key={p.userId} player={p} cell={cell} />
          ))}
        </>
      )}
    </FarmStage>
  );
}
