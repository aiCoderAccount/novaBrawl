export type HeroState = 'idle' | 'run' | 'jump' | 'dash' | 'death' | 'select';
export type WeaponType = 'ranged' | 'melee';
export type EffectType = 'buff' | 'healing';

export interface HeroAnimDef {
  frameCount: number;
  frameRate: number;
  repeat: number;    // -1 = loop, 0 = play once
}

export interface HeroConfig {
  id: number;                                   // 1–6
  name: string;
  speed: number;
  health: number;
  originX: number;   // normalised horizontal anchor of character centre within frame
  originY: number;   // normalised vertical anchor
  anims: Record<HeroState, HeroAnimDef>;
}

export interface WeaponConfig {
  id: string;               // e.g. 'laser-beam'
  displayName: string;
  type: WeaponType;
  frameCount: number;
  frameRate: number;
  bulletTextureKey?: string;
  projectileSpeed?: number;
  damage: number;
  projectileCount?: number;
  spreadDeg?: number;
  swingDurationMs?: number;
}

export interface ProjectileConfig {
  textureKey: string;
  speed: number;
  damage: number;
  lifespan: number;         // ms
}

export interface BuffConfig {
  id: string;               // e.g. 'buff-1'
  type: EffectType;
  frameCount: number;
  frameRate: number;
  repeat: number;
  statBoost?: Partial<{ speed: number; damage: number; defense: number }>;
  healAmount?: number;
}

export interface DustConfig {
  id: string;               // e.g. 'dash-dust'
  frameCount: number;
  frameRate: number;
  repeat: number;
}
