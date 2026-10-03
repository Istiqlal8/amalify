import { useCallback, useState } from 'react';

import type { DayView } from '@/domain/farmDay';

/** Which garden panel is open. Only one at a time: the calendar sits over the map, the day over it. */
export type PanelState = { months: boolean; month: number | null; day: DayView | null };

const CLOSED: PanelState = { months: false, month: null, day: null };

export type Panels = PanelState & {
  openMonths: () => void;
  openMonth: (index: number) => void;
  openDay: (view: DayView) => void;
  closeDay: () => void;
  closeMonth: () => void;
  closeMonths: () => void;
};

/** Opening a month from the month list replaces it, so closing the month returns to the map. */
export function useGardenPanels(): Panels {
  const [state, setState] = useState<PanelState>(CLOSED);
  const openMonths = useCallback(() => setState({ ...CLOSED, months: true }), []);
  const openMonth = useCallback((index: number) => setState({ months: false, month: index, day: null }), []);
  const openDay = useCallback((view: DayView) => setState((s) => ({ ...s, day: view })), []);
  const closeDay = useCallback(() => setState((s) => ({ ...s, day: null })), []);
  const closeMonth = useCallback(() => setState(CLOSED), []);
  const closeMonths = useCallback(() => setState(CLOSED), []);
  return { ...state, openMonths, openMonth, openDay, closeDay, closeMonth, closeMonths };
}
