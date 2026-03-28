import Phaser from 'phaser';
import type { WeaponConfig } from '../../types';
import { Weapon } from './Weapon';

export class MeleeWeapon extends Weapon {
  private isSwinging = false;

  constructor(scene: Phaser.Scene, config: WeaponConfig) {
    super(scene, config);
  }

  fire(): void {
    if (this.isSwinging) return;
    this.isSwinging = true;
    this.sprite.play(`weapon_${this.config.id}`, true);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isSwinging = false;
    });
  }
}
