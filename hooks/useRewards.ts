import { useCallback, useMemo } from 'react';

import { earnedPoints } from '@/domain/points';
import * as shop from '@/domain/shop';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

export type Rewards = {
  balance: number;
  unlocks: shop.Unlocks;
  owns: (item: shop.ShopItem) => boolean;
  canBuy: (item: shop.ShopItem) => boolean;
  buy: (item: shop.ShopItem) => void;
  /** Puts an owned item to use: the flower in the theme, the animal, garden theme or pet in the unlocks. */
  use: (item: shop.ShopItem) => void;
  /** Walk without a pet. */
  dropPet: () => void;
  /** Adds bonus points; used by the development-only grant in the shop. */
  grant: (amount: number) => void;
  inUse: (item: shop.ShopItem) => boolean;
};

/** Points earned from amal yaumi, what they bought, and the current picks. */
export function useRewards(): Rewards {
  const { logs, plan, haid, today, todayPercent, unlocks, setUnlocks } = useLogs();
  const { flower, setFlower } = useTheme();
  const fromAmal = useMemo(() => earnedPoints(logs, plan.items, haid, today, todayPercent), [logs, plan.items, haid, today, todayPercent]);
  const earned = fromAmal + unlocks.bonus;
  // The flower in use is always owned, so users who picked one before the shop existed keep it.
  const owns = useCallback(
    (item: shop.ShopItem) => shop.owns(unlocks, item) || (item.kind === 'flower' && item.id === flower),
    [unlocks, flower],
  );
  const buy = useCallback((item: shop.ShopItem) => setUnlocks((u) => shop.buy(earned, u, item, Date.now())), [earned, setUnlocks]);
  const use = useCallback(
    (item: shop.ShopItem) => {
      if (!owns(item)) return;
      if (item.kind === 'flower') setFlower(item.id);
      else if (item.kind === 'animal') setUnlocks((u) => shop.chooseAnimal(u, item.id, Date.now()));
      else if (item.kind === 'pet') setUnlocks((u) => shop.choosePet(u, item.id, Date.now()));
      else if (item.kind === 'mount') setUnlocks((u) => shop.chooseMount(u, item.id, Date.now()));
      else if (item.kind === 'house') setUnlocks((u) => shop.chooseHouse(u, item.id, Date.now()));
      else setUnlocks((u) => shop.chooseTheme(u, item.id, Date.now()));
    },
    [owns, setFlower, setUnlocks],
  );
  const inUse = useCallback(
    (item: shop.ShopItem) =>
      ({ flower, animal: unlocks.animal, theme: unlocks.theme, pet: unlocks.pet, mount: unlocks.mount, house: unlocks.house })[item.kind] === item.id,
    [flower, unlocks],
  );
  return {
    balance: shop.balance(earned, unlocks),
    unlocks,
    owns,
    canBuy: (item) => !owns(item) && shop.canBuy(earned, unlocks, item),
    buy,
    use,
    dropPet: () => setUnlocks((u) => shop.choosePet(u, null, Date.now())),
    grant: (amount) => setUnlocks((u) => shop.grantBonus(u, amount)),
    inUse,
  };
}
