/**
 * Realtime filters are applied on the device now that every screen shares one unfiltered
 * listener per table, so the same change is delivered — and billed — once.
 */

/**
 * Whether `row` satisfies a Realtime filter such as `group_id=eq.<id>` or `day=gte.<day>`.
 * Only those two operators are used by this app; any other filter matches, so a watcher
 * reloads rather than risk missing a change. A column the row does not carry matches too.
 */
export function matchesFilter(filter: string | undefined, row: Record<string, unknown>): boolean {
  if (!filter) return true;
  const parts = /^(\w+)=(eq|gte)\.(.*)$/.exec(filter);
  if (!parts) return true;
  const [, column, op, value] = parts;
  const cell = row[column];
  if (cell === undefined || cell === null) return true;
  return op === 'eq' ? String(cell) === value : String(cell) >= value;
}
