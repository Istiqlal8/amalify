import type { FlowerId } from '@/domain/flowers';

import type { SpeciesArt } from './shared';
import { mawar, melati, sepatu } from './shrubs';
import { anggrek, teratai } from './special';
import { daisy, lavender, matahari, tulip } from './stems';
import { sakura } from './trees';

export const SPECIES: Record<FlowerId, SpeciesArt> = {
  sakura, matahari, mawar, tulip, melati, daisy, lavender, anggrek, teratai, sepatu,
};

/** Lotus grows in water, so its pot shows water instead of soil. */
export const GROWS_IN_WATER: ReadonlySet<FlowerId> = new Set(['teratai']);
