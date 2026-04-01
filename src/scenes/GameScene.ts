import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { HERO_CONFIGS } from '../config/HeroConfigs';
import { WEAPON_CONFIGS } from '../config/WeaponConfigs';
import { MeleeWeapon } from '../entities/weapons/MeleeWeapon';
import { RangedWeapon } from '../entities/weapons/RangedWeapon';
import { BeamWeapon } from '../entities/weapons/BeamWeapon';
import type { WeaponConfig } from '../types';
import type { Weapon } from '../entities/weapons/Weapon';

function createWeapon(scene: Phaser.Scene, config: WeaponConfig): Weapon {
  if (config.type === 'melee') return new MeleeWeapon(scene, config);
  if (config.type === 'beam') return new BeamWeapon(scene, config);
  return new RangedWeapon(scene, config);
}

export class GameScene extends Phaser.Scene {
  private hero!: Hero;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.hero = new Hero(this, width / 2, height / 2, HERO_CONFIGS[0]);
    this.hero.initCursors(this.input.keyboard!);

    const laserBeam = createWeapon(this, WEAPON_CONFIGS.find(c => c.id === 'laser-beam')!);
    const shotgun = createWeapon(this, WEAPON_CONFIGS.find(c => c.id === 'shotgun')!);
    this.hero.equipWeapons([laserBeam, shotgun]);
  }

  update(): void {
    this.hero.update();
  }
}
