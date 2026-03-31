import type { HeroConfig } from '../types';

export const HERO_CONFIGS: HeroConfig[] = [
  {
    id: 1,
    name: 'Hero 1',
    speed: 220,
    health: 100,

    originX: 0.45,
    originY: 0.69,
    anims: {
      idle:   { frameCount: 4,  frameRate: 8,  repeat: -1 },
      run:    { frameCount: 5,  frameRate: 10, repeat: -1 },
      jump:   { frameCount: 10, frameRate: 10, repeat: 0  },
      dash:   { frameCount: 12, frameRate: 30, repeat: 0  },
      death:  { frameCount: 12, frameRate: 8,  repeat: 0  },
      select: { frameCount: 20, frameRate: 10, repeat: -1 },
    },
  },
  {
    id: 2,
    name: 'Hero 2',
    speed: 220,
    health: 100,

    originX: 0.45,
    originY: 0.70,
    anims: {
      idle:   { frameCount: 4,  frameRate: 8,  repeat: -1 },
      run:    { frameCount: 5,  frameRate: 10, repeat: -1 },
      jump:   { frameCount: 10, frameRate: 10, repeat: 0  },
      dash:   { frameCount: 10, frameRate: 12, repeat: 0  },
      death:  { frameCount: 12, frameRate: 8,  repeat: 0  },
      select: { frameCount: 20, frameRate: 10, repeat: -1 },
    },
  },
  {
    id: 3,
    name: 'Hero 3',
    speed: 220,
    health: 100,

    originX: 0.45,
    originY: 0.70,
    anims: {
      idle:   { frameCount: 4,  frameRate: 8,  repeat: -1 },
      run:    { frameCount: 5,  frameRate: 10, repeat: -1 },
      jump:   { frameCount: 10, frameRate: 10, repeat: 0  },
      dash:   { frameCount: 10, frameRate: 12, repeat: 0  },
      death:  { frameCount: 12, frameRate: 8,  repeat: 0  },
      select: { frameCount: 20, frameRate: 10, repeat: -1 },
    },
  },
  {
    id: 4,
    name: 'Hero 4',
    speed: 220,
    health: 100,

    originX: 0.46,
    originY: 0.71,
    anims: {
      idle:   { frameCount: 4,  frameRate: 8,  repeat: -1 },
      run:    { frameCount: 5,  frameRate: 10, repeat: -1 },
      jump:   { frameCount: 11, frameRate: 10, repeat: 0  },
      dash:   { frameCount: 12, frameRate: 12, repeat: 0  },
      death:  { frameCount: 12, frameRate: 8,  repeat: 0  },
      select: { frameCount: 20, frameRate: 10, repeat: -1 },
    },
  },
  {
    id: 5,
    name: 'Hero 5',
    speed: 220,
    health: 100,

    originX: 0.46,
    originY: 0.72,
    anims: {
      idle:   { frameCount: 4,  frameRate: 8,  repeat: -1 },
      run:    { frameCount: 5,  frameRate: 10, repeat: -1 },
      jump:   { frameCount: 11, frameRate: 10, repeat: 0  },
      dash:   { frameCount: 12, frameRate: 12, repeat: 0  },
      death:  { frameCount: 12, frameRate: 8,  repeat: 0  },
      select: { frameCount: 20, frameRate: 10, repeat: -1 },
    },
  },
  {
    id: 6,
    name: 'Hero 6',
    speed: 220,
    health: 100,

    originX: 0.46,
    originY: 0.72,
    anims: {
      idle:   { frameCount: 4,  frameRate: 8,  repeat: -1 },
      run:    { frameCount: 5,  frameRate: 10, repeat: -1 },
      jump:   { frameCount: 11, frameRate: 10, repeat: 0  },
      dash:   { frameCount: 12, frameRate: 12, repeat: 0  },
      death:  { frameCount: 12, frameRate: 8,  repeat: 0  },
      select: { frameCount: 20, frameRate: 10, repeat: -1 },
    },
  },
];
