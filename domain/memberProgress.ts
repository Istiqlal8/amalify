/** Enough of a member to place them on the board; the rest of the row is carried through. */
type Progress = { userId: string; percent: number; hidden: boolean };

const percentOf = (row: Record<string, unknown>): number | null => (typeof row.percent === 'number' ? row.percent : null);

/**
 * Applies `daily_summaries` rows straight onto the members already on screen, so a mate ticking
 * an item off redraws the board without anyone refetching it. A member the rows do not mention
 * keeps their progress; `percent` null means they hid it. Rows for unknown members are ignored,
 * because a newcomer needs their name and avatar, which a summary row does not carry.
 */
export function patchProgress<T extends Progress>(members: T[], rows: Record<string, unknown>[]): T[] {
  const byUser = new Map<string, number | null>();
  for (const row of rows) {
    if (typeof row.user_id === 'string') byUser.set(row.user_id, percentOf(row));
  }
  return members
    .map((m) => {
      if (!byUser.has(m.userId)) return m;
      const shared = byUser.get(m.userId) ?? null;
      return { ...m, percent: shared ?? 0, hidden: shared === null };
    })
    .sort((a, b) => b.percent - a.percent);
}
