import Phaser from 'phaser';
import type { ProjectileConfig } from '../../types';

const TRAIL_COLORS = [0xffcc00, 0xffaa33, 0xff8800];
const TRAIL_INTERVAL_MS = 40;

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private damage = 0;
  private lifespan = 0;
  private elapsed = 0;
  private trailParticles = false;
  private trailTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '__DEFAULT');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false).setVisible(false);
  }

  launch(x: number, y: number, angleDeg: number, config: ProjectileConfig): void {
    this.setActive(true).setVisible(true).setTexture(config.textureKey);
    this.setScale(config.scale ?? 1);
    this.setPosition(x, y);
    this.damage = config.damage;
    this.lifespan = config.lifespan;
    this.elapsed = 0;
    this.trailParticles = config.trailParticles ?? false;
    this.trailTimer = 0;
    const rad = Phaser.Math.DegToRad(angleDeg);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(rad) * config.speed,
      Math.sin(rad) * config.speed,
    );
  }

  // Deactivates projectile once lifespan has reached max
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.active) return;

    this.elapsed += delta;
    this.trailTimer += delta;

    if (this.trailParticles && this.trailTimer >= TRAIL_INTERVAL_MS) {
      this.trailTimer = 0;
      this.spawnTrailSpark();
    }

    if (this.elapsed >= this.lifespan) {
      this.deactivate();
    }
  }

  private spawnTrailSpark(): void {
    const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
    const radius = 1 + Math.random();
    const spark = this.scene.add.arc(
      this.x + (Math.random() - 0.5) * 2,
      this.y + (Math.random() - 0.5) * 2,
      radius, 0, 360, false, color, 0.6,
    );
    spark.setDepth(7);

    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 0.3,
      duration: 130 + Math.random() * 60,
      ease: 'Sine.easeIn',
      onComplete: () => { spark.destroy(); },
    });
  }

  deactivate(): void {
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  getDamage(): number {
    return this.damage;
  }
}
