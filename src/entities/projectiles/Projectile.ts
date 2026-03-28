import Phaser from 'phaser';
import type { ProjectileConfig } from '../../types';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private damage = 0;
  private lifespan = 0;
  private elapsed = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '__DEFAULT');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false).setVisible(false);
  }

  launch(x: number, y: number, angleDeg: number, config: ProjectileConfig): void {
    this.setActive(true).setVisible(true).setTexture(config.textureKey);
    this.setPosition(x, y);
    this.damage = config.damage;
    this.lifespan = config.lifespan;
    this.elapsed = 0;
    const rad = Phaser.Math.DegToRad(angleDeg);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(rad) * config.speed,
      Math.sin(rad) * config.speed,
    );
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this.elapsed += delta;
    if (this.elapsed >= this.lifespan) {
      this.deactivate();
    }
  }

  deactivate(): void {
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  getDamage(): number {
    return this.damage;
  }
}
