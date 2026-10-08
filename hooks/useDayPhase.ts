import { useEffect, useState } from 'react';

import { hourNow, phaseAt, type DayPhase } from '@/domain/dayPhase';

const TICK_MS = 60_000; // the sky does not need to be redrawn every second

/**
 * The garden's current sky phase from the device clock, re-checked every minute. A walk at dusk
 * then looks like dusk without the caller wiring any timers.
 */
export function useDayPhase(): DayPhase {
  const [hour, setHour] = useState(() => hourNow());
  useEffect(() => {
    const id = setInterval(() => setHour(hourNow()), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return phaseAt(hour);
}
