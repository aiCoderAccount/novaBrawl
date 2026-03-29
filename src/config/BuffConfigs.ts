import type { BuffConfig } from '../types';

export const BUFF_CONFIGS: BuffConfig[] = [
  {
    id: 'buff-1',
    type: 'buff',
    frameCount: 8,
    frameRate: 10,
    repeat: -1,
    statBoost: { speed: 50 },
  },
  {
    id: 'buff-2',
    type: 'buff',
    frameCount: 8,
    frameRate: 10,
    repeat: -1,
    statBoost: { damage: 10 },
  },
  {
    id: 'buff-3',
    type: 'buff',
    frameCount: 9,
    frameRate: 10,
    repeat: -1,
    statBoost: { defense: 20 },
  },
  {
    id: 'healing',
    type: 'healing',
    frameCount: 9,
    frameRate: 10,
    repeat: 0,
    healAmount: 30,
  },
];
