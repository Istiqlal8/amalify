import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/constants/theme';
import { plotTile, SCENE_ROWS } from '@/domain/farm';
import { buildGroupFarm, firstName, flowerFor, type MemberBed } from '@/domain/groupFarm';
import { useFarmAudio } from '@/hooks/useFarmAudio';
import { useFarmPresence } from '@/hooks/useFarmPresence';
import { useFarmSfx } from '@/hooks/useFarmSfx';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import type { MemberToday } from '@/services/groupService';

import { GroupBackground } from './Backgrounds';
import { BedTile } from './BedTile';
import { FarmStage } from './FarmStage';
import { RemotePlayer } from './RemotePlayer';
import { useMotion } from './Walker';

type Props = { groupId: string; members: MemberToday[]; userId: string; name: string };

const captionOf = (bed: MemberBed) => `${bed.name} · ${bed.percent}%`;

/** Shared farm: one bed per member for today, and every member on the farm right now walking around. */
export function GroupFarmScene({ groupId, members, userId, name }: Props) {
  const [near, setNear] = useState(-1);
  const motion = useMotion();
  const { flower } = useTheme();
  const { animal, theme, pet } = useLogs().unlocks;
  const me = useMemo(() => ({ userId, name, animal, flower, pet }), [userId, name, animal, flower, pet]);
  const players = useFarmPresence(groupId, me, motion);
  const bottom = useSafeAreaInsets().bottom + space.md;
  const beds = useMemo(() => buildGroupFarm(members), [members]);
  const bedCount = beds.length;
  const current = beds[near];
  const { sfx } = useFarmAudio(theme);
  const { onStep, onGrab, onBed } = useFarmSfx(sfx, false);
  const onNearPlot = useCallback(
    (index: number) => {
      setNear(index);
      onBed(index < bedCount ? index : -1);
    },
    [onBed, bedCount],
  );

  return (
    <FarmStage
      theme={theme}
      rows={SCENE_ROWS}
      background={(cell, art) => <GroupBackground cell={cell} art={art} />}
      top={0}
      bottom={bottom}
      caption={current ? captionOf(current) : null}
      motion={motion}
      animal={animal}
      pet={pet}
      onNearPlot={onNearPlot}
      onStep={onStep}
      onGrab={onGrab}>
      {(cell) => (
        <>
          {beds.map((bed, i) => (
            <BedTile
              key={bed.userId}
              x={plotTile(bed).x}
              y={plotTile(bed).y}
              cell={cell}
              flower={bed.userId === userId ? flower : (players[bed.userId]?.flower ?? flowerFor(bed.userId))}
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
