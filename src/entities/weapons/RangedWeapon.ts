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

  fire(pointer: Phaser.Input.Pointer): void {
    if (!this.host || !this.config.bulletFrameKey || !this.canFire()) return;
    this.markFired();

    this.sprite.play(`weapon_${this.config.id}`, true);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.sprite.setTexture(`weapon_${this.config.id}_01`);
    });

    const count = this.config.projectileCount ?? 1;
    const spread = this.config.spreadDeg ?? 0;
    const projConfig: ProjectileConfig = {
      textureKey: this.config.bulletFrameKey,
      speed: this.config.projectileSpeed ?? 400,
      damage: this.config.damage,
      lifespan: this.config.lifespanMs ?? 2000,
      trailParticles: this.config.bulletTrail,
      scale: this.config.projectileScale,
    };

    // World-space spawn position: container origin + attachment-point local offset
    const localPos = this.getAttachmentLocalPosition();
    const dirSign = this.host.facingLeft ? -1 : 1;
    const spawnX = this.host.x + (localPos?.x ?? 0) + dirSign * 15;
    const spawnY = this.host.y + (localPos?.y ?? 17) + 4;

    const baseAngle = this.host.facingLeft ? 180 : 0;

    for (let i = 0; i < count; i++) {
      const angleOffset = count > 1 ? (i - (count - 1) / 2) * (spread / (count - 1)) : 0;
      const angle = baseAngle + angleOffset;
      const proj = this.projectileGroup.get(spawnX, spawnY) as Projectile | null;
      if (proj) {
        proj.launch(spawnX, spawnY, angle, projConfig);
      }
    }

    if (this.config.muzzleSmoke) {
      this.spawnSmokePuffs(spawnX, spawnY, dirSign);
    }
  }

  private spawnSmokePuffs(x: number, y: number, dirSign: number): void {
    const PUFF_COUNT = 7;
    const COLORS = [0x999999, 0xaaaaaa, 0x888888, 0xbbbbbb, 0x777777];

    for (let i = 0; i < PUFF_COUNT; i++) {
      const offsetX = (Math.random() - 0.3) * 10 * dirSign;
      const offsetY = (Math.random() - 0.5) * 10;
      const radius = 3 + Math.random() * 4;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const alpha = 0.25 + Math.random() * 0.2;
      const duration = 280 + Math.random() * 160;
      const driftX = dirSign * (20 + Math.random() * 30);
      const driftY = (Math.random() - 0.5) * 20;

      const puff = this.scene.add.arc(x + offsetX, y + offsetY, radius, 0, 360, false, color, alpha);
      puff.setDepth(8);

      this.scene.tweens.add({
        targets: puff,
        x: puff.x + driftX,
        y: puff.y + driftY,
        scale: 2.5 + Math.random(),
        alpha: 0,
        duration,
        ease: 'Sine.easeOut',
        onComplete: () => { puff.destroy(); },
      });
    }
  }
}
