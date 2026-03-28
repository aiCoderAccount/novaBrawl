import type { EffectConfig } from '../types';

export const EFFECT_CONFIGS: EffectConfig[] = [
  {
    id: 'buff-1',
    type: 'buff',
    frameCount: 8,
    frameRate: 10,
    repeat: -1,
    assetFolder: 'Buff 1',
    assetFileStem: 'Buff-1',
    statBoost: { speed: 50 },
  },
  {
    id: 'buff-2',
    type: 'buff',
    frameCount: 8,
    frameRate: 10,
    repeat: -1,
    assetFolder: 'Buff 2',
    assetFileStem: 'Buff-2',
    statBoost: { damage: 10 },
  },
  {
    id: 'buff-3',
    type: 'buff',
    frameCount: 9,
    frameRate: 10,
    repeat: -1,
    assetFolder: 'Buff 3',
    assetFileStem: 'Buff-3',
    statBoost: { defense: 20 },
  },
  {
    id: 'healing',
    type: 'healing',
    frameCount: 9,
    frameRate: 10,
    repeat: 0,
    assetFolder: 'Healing',
    assetFileStem: 'Healing',
    healAmount: 30,
  },
];
