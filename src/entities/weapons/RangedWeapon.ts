import Phaser from 'phaser';
import type { WeaponConfig, ProjectileConfig } from '../../types';
import { Weapon } from './Weapon';
import { Projectile } from '../projectiles/Projectile';

export class RangedWeapon extends Weapon {
  private projectileGroup: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, config: WeaponConfig) {
    super(scene, config);
    this.projectileGroup = scene.add.group({
      classType: Projectile,
      runChildUpdate: true,
    });
  }

  fire(): void {
    if (!this.host || !this.config.bulletFrameKey) return;

    this.sprite.play(`weapon_${this.config.id}`, true);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.sprite.setTexture(`weapon_${this.config.id}_01`);
    });

    const count = this.config.projectileCount ?? 1;
    const spread = this.config.spreadDeg ?? 0;
    const baseAngle = this.host.flipX ? 180 : 0;
    const projConfig: ProjectileConfig = {
      textureKey: this.config.bulletFrameKey,
      speed: this.config.projectileSpeed ?? 400,
      damage: this.config.damage,
      lifespan: 2000,
    };

    // Fire projectiles evenly across a cone
    for (let i = 0; i < count; i++) {
      const angleOffset = count > 1 ? (i - (count - 1) / 2) * (spread / (count - 1)) : 0;
      const angle = baseAngle + angleOffset;
      const proj = this.projectileGroup.get(this.host.x, this.host.y) as Projectile | null;
      if (proj) {
        proj.launch(this.host.x, this.host.y, angle, projConfig);
      }
    }
  }
}
