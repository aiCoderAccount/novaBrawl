import Phaser from 'phaser';
import type { WeaponConfig } from '../../types';

export interface IHeroRef {
  x: number;
  y: number;
  facingLeft: boolean;
}

export abstract class Weapon {
  protected sprite: Phaser.GameObjects.Sprite;
  protected host: IHeroRef | null = null;
  readonly config: WeaponConfig;
  protected scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: WeaponConfig) {
    this.scene = scene;
    this.config = config;
    // Create sprite without adding to scene display list — added as a container child via addToContainer()
    this.sprite = new Phaser.GameObjects.Sprite(scene, 6, 10, `weapon_${config.id}_01`);
    this.sprite.setOrigin(config.originX ?? 0.5, config.originY ?? 0.5);
    this.sprite.setScale(1.3);
    this.sprite.setVisible(false);
  }

  addToContainer(container: Phaser.GameObjects.Container): void {
    container.add(this.sprite);
  }

  attach(hero: IHeroRef): void {
    this.host = hero;
    this.sprite.setVisible(true);
    this.sprite.setTexture(`weapon_${this.config.id}_01`);
  }

  detach(): void {
    this.host = null;
    this.sprite.setVisible(false);
    this.sprite.stop();
  }

  // Sync local offset and flip to match hero facing direction
  update(): void {
    if (this.host) {
      const offsetX = this.host.facingLeft ? -6 : 6;
      this.sprite.setPosition(offsetX, 10);
      this.sprite.setFlipX(this.host.facingLeft);
    }
  }

  abstract fire(): void;

  destroy(): void {
    this.sprite.destroy();
  }
}
