export type HeroState = 'idle' | 'run' | 'jump' | 'dash' | 'death' | 'select';
export type WeaponType = 'ranged' | 'melee' | 'beam';
export type EffectType = 'buff' | 'healing';
export type EnemyType = 'melee' | 'ranged' | 'boss';
export type EnemyState = 'idle' | 'walk' | 'attack' | 'attack-a' | 'attack-b' | 'jump-fly' | 'death';

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
  hitboxWidth?: number;
  hitboxHeight?: number;
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
  fireRateMs?: number;
  originX?: number;
  originY?: number;
  offsetX?: number;
  beamDurationMs?: number;
  lifespanMs?: number;
  muzzleSmoke?: boolean;
  muzzlePuffCount?: number;
  bulletTrail?: boolean;
  projectileScale?: number;
}

export interface ProjectileConfig {
  textureKey: string;
  speed: number;
  damage: number;
  lifespan: number;
  trailParticles?: boolean;
  scale?: number;
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

export interface EnemyAnimDef {
  frameCount: number;
  frameRate: number;
  repeat: number;
  folder?: string;      // subfolder under assets/enemies/{id}/ (defaults to state name)
  filePrefix?: string;  // filename prefix without frame number (defaults to {id}_{state} with underscores)
}

export interface MinionSpawnConfig {
  enemyId: string;
  frames: number[];  // 1-indexed frame numbers in the attack-b animation
}

export interface EnemyConfig {
  id: string;
  name: string;
  speed: number;
  health: number;
  damage: number;
  attackRange: number;
  detectionRange: number;
  type: EnemyType;
  bulletKey?: string;
  bulletScale?: number;
  bulletOriginNormY?: number;  // normalized 0-1 position on sprite height where bullet fires from (0=top, 1=bottom)
  originX: number;
  originY: number;
  scale: number;
  hitboxWidth?: number;
  hitboxHeight?: number;
  hoverOffsetY?: number;
  healthBarOffsetY?: number;
  anims: Partial<Record<EnemyState, EnemyAnimDef>>;
  spawnConfig?: MinionSpawnConfig;
}
