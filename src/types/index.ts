export type HeroState = 'idle' | 'run' | 'jump' | 'dash' | 'death' | 'select';
export type WeaponType = 'ranged' | 'melee';
export type EffectType = 'buff' | 'healing';

export interface HeroAnimDef {
  frameCount: number;
  frameRate: number;
  repeat: number;    
}

export interface HeroConfig {
  id: number;                                   
  name: string;
  speed: number;
  health: number;
  originX: number;   
  originY: number;   
  anims: Record<HeroState, HeroAnimDef>;
}

export interface WeaponConfig {
  id: string;
  displayName: string;
  type: WeaponType;
  frameCount: number;
  frameRate: number;
  bulletFrameKey?: string;
  projectileSpeed?: number;
  damage: number;
  projectileCount?: number;
  spreadDeg?: number;
  swingDurationMs?: number;
  originX?: number;
  originY?: number;
}

export interface ProjectileConfig {
  textureKey: string;
  speed: number;
  damage: number;
  lifespan: number;       
}

export interface BuffConfig {
  id: string;             
  type: EffectType;
  frameCount: number;
  frameRate: number;
  repeat: number;
  statBoost?: Partial<{ speed: number; damage: number; defense: number }>;
  healAmount?: number;
}

export interface DustConfig {
  id: string;
  filePrefix?: string;
  frameCount: number;
  frameRate: number;
  repeat: number;
}

export interface AttachmentPoint {
  x: number;
  y: number;
}
