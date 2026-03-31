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
    const baseAngle = this.host.facingLeft ? 180 : 0;
    const projConfig: ProjectileConfig = {
      textureKey: this.config.bulletFrameKey,
      speed: this.config.projectileSpeed ?? 400,
      damage: this.config.damage,
      lifespan: 2000,
    };

    // World-space spawn position: container origin + weapon local offset
    const offsetX = this.host.facingLeft ? -6 : 6;
    const spawnX = this.host.x + offsetX;
    const spawnY = this.host.y + 17; // weapon local y (10) + extra vertical offset (7)

    for (let i = 0; i < count; i++) {
      const angleOffset = count > 1 ? (i - (count - 1) / 2) * (spread / (count - 1)) : 0;
      const angle = baseAngle + angleOffset;
      const proj = this.projectileGroup.get(spawnX, spawnY) as Projectile | null;
      if (proj) {
        proj.launch(spawnX, spawnY, angle, projConfig);
      }
    }
  }
}
