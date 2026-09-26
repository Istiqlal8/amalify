import { useState } from 'react';

import { type MountId, RIDE_SPEED } from '@/domain/estate';

import { type Motion, setMotionSpeed, startJump } from './motion';

/** Getting on and off the owned horse (faster while riding) and jumping; `riding` is the horse ridden, or null. */
export function useRiding(motion: Motion, mount: MountId | null) {
  const [wanted, setWanted] = useState(false);
  const riding = wanted && mount !== null ? mount : null;
  const toggle = () => {
    setMotionSpeed(motion, riding ? 1 : RIDE_SPEED);
    setWanted(!riding);
  };
  const jump = () => startJump(motion);
  return { riding, toggle, jump };
}
