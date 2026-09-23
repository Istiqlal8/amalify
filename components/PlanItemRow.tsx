import { countOf, type DayEntry } from '@/domain/dayLog';
import type { PlanItem } from '@/domain/plan';

import { AmalItem } from './AmalItem';
import { CountItem } from './CountItem';

type Props = { item: PlanItem; entry: DayEntry | undefined; onSet: (id: string, value: number) => void };

export function PlanItemRow({ item, entry, onSet }: Props) {
  const count = countOf(entry, item.id);
  if (item.kind === 'count') {
    return (
      <CountItem label={item.label} count={count} target={item.target} unit={item.unit} onChange={(v) => onSet(item.id, v)} />
    );
  }
  const done = count >= 1;
  return <AmalItem label={item.label} done={done} onToggle={() => onSet(item.id, done ? 0 : 1)} />;
}
