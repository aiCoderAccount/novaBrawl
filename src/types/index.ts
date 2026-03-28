export type HeroState = 'idle' | 'run' | 'jump' | 'dash' | 'death' | 'select';
export type WeaponType = 'ranged' | 'melee';
export type EffectType = 'buff' | 'healing';

export interface HeroAnimDef {
  frameCount: number;
  frameRate: number;
  repeat: number;    // -1 = loop, 0 = play once
  padded: boolean;   // whether frame numbers are zero-padded to 2 digits
}

export interface HeroConfig {
  id: number;                                   // 1–6
  name: string;
  speed: number;
  health: number;
  selectFolder: 'Character Select' | 'Select';
  hasDashDust: boolean;
  anims: Record<HeroState, HeroAnimDef>;
}

export interface WeaponConfig {
  id: string;               // e.g. 'laser-beam'
  displayName: string;
  type: WeaponType;
  frameCount: number;
  frameRate: number;
  assetFolder: string;      // disk folder under assets/Weapons/
  assetFileStem: string;    // filename prefix before _N.png
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

export interface EffectConfig {
  id: string;               // e.g. 'buff-1'
  type: EffectType;
  frameCount: number;
  frameRate: number;
  repeat: number;
  assetFolder: string;      // disk folder under assets/Buffs/
  assetFileStem: string;    // filename prefix before _N.png
  statBoost?: Partial<{ speed: number; damage: number; defense: number }>;
  healAmount?: number;
}
