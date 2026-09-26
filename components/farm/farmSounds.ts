import { type AudioPlayer, createAudioPlayer } from 'expo-audio';

import { type Ambience, type Sfx, SFX_VOLUME } from '@/domain/farmSound';

// CC0 nature ambience and effects; see assets/sounds/farm/CREDITS.md.
export const AMBIENCE_SOURCES: Record<Ambience, number> = {
  birds: require('@/assets/sounds/farm/amb_birds.m4a'),
  waves: require('@/assets/sounds/farm/amb_waves.m4a'),
  wind: require('@/assets/sounds/farm/amb_wind.m4a'),
  crickets: require('@/assets/sounds/farm/amb_crickets.m4a'),
};

const SFX_SOURCES: Record<Sfx, number> = {
  step: require('@/assets/sounds/farm/sfx_step.m4a'),
  hoof: require('@/assets/sounds/farm/sfx_hoof.m4a'),
  land: require('@/assets/sounds/farm/sfx_hoof.m4a'), // same clop, louder, as the horse touches down
  bed: require('@/assets/sounds/farm/sfx_bed.m4a'),
  grab: require('@/assets/sounds/farm/sfx_grab.m4a'),
  buy: require('@/assets/sounds/farm/sfx_buy.m4a'),
  equip: require('@/assets/sounds/farm/sfx_equip.m4a'),
  gate: require('@/assets/sounds/farm/sfx_gate.m4a'),
  teleport: require('@/assets/sounds/farm/sfx_teleport.m4a'),
};

// One small player per effect for the whole app, created on first use and reused.
const players: Partial<Record<Sfx, AudioPlayer>> = {};

/** Plays an effect from the start. Callers check `soundAllowed` first. */
export function playSfx(name: Sfx): void {
  const player = players[name] ?? (players[name] = createAudioPlayer(SFX_SOURCES[name]));
  player.volume = SFX_VOLUME[name];
  player.seekTo(0).catch(() => undefined);
  player.play();
}
