export type PlantStage = 0 | 1 | 2 | 3 | 4;

export const STAGE_NAMES: Record<PlantStage, string> = {
  0: 'Biji',
  1: 'Tunas',
  2: 'Semai',
  3: 'Pohon muda',
  4: 'Pohon berbunga',
};

export function stageFromPercent(percent: number): PlantStage {
  if (percent >= 100) return 4;
  if (percent >= 65) return 3;
  if (percent >= 35) return 2;
  if (percent > 0) return 1;
  return 0;
}
