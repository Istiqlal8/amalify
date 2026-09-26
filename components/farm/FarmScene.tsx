import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type FarmPlot, plotCaption, plotTile } from '@/domain/farm';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';
import { useTheme } from '@/providers/ThemeProvider';

import { BedTile } from './BedTile';
import { FarmStage } from './FarmStage';
import { SCENE } from './farmSprites';
import { useMotion } from './Walker';

const captionOf = (plot: FarmPlot, isToday: boolean) => `${plotCaption(plot.key, plot.percent)}${isToday ? ' · hari ini' : ''}`;

/** The personal Kebun: one bed per day for the last 28 days, oldest top-left, today last. */
export function FarmScene({ plots }: { plots: FarmPlot[] }) {
  const [near, setNear] = useState(-1);
  const motion = useMotion();
  const { flower } = useTheme();
  const top = useSafeAreaInsets().top;
  const bottom = useTabBarSpace();
  const todayIndex = plots.length - 1;
  const current = plots[near];

  return (
    <FarmStage
      scene={SCENE}
      top={top}
      bottom={bottom}
      caption={current ? captionOf(current, near === todayIndex) : null}
      motion={motion}
      animal="rabbit"
      onNearPlot={setNear}>
      {(cell) =>
        plots.map((plot, i) => (
          <BedTile
            key={plot.key}
            x={plotTile(plot).x}
            y={plotTile(plot).y}
            cell={cell}
            flower={flower}
            stage={plot.stage}
            label={`${captionOf(plot, i === todayIndex)}${plot.onHaid ? ', haid' : ''}`}
            highlight={i === todayIndex}
            active={i === near}
            marker={plot.onHaid}
          />
        ))
      }
    </FarmStage>
  );
}
