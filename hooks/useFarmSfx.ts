import { useCallback, useRef } from 'react';

import { isGateCell, type Sfx, stepDue } from '@/domain/farmSound';

/** Farm effect triggers: throttled footsteps, a creak at field gates (Kebun map only), a chime at a bed, a click on the stick. */
export function useFarmSfx(sfx: (name: Sfx) => void, gates: boolean, riding = false) {
  const lastStep = useRef(0);
  const onStep = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (gates && isGateCell(x, y)) return sfx('gate');
      if (!stepDue(lastStep.current, now)) return;
      lastStep.current = now;
      sfx(riding ? 'hoof' : 'step');
    },
    [sfx, gates, riding],
  );
  const onGrab = useCallback(() => sfx('grab'), [sfx]);
  const onBed = useCallback((index: number) => index >= 0 && sfx('bed'), [sfx]);
  return { onStep, onGrab, onBed };
}
