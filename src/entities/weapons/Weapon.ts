import Phaser from 'phaser';
import type { WeaponConfig } from '../../types';

export interface IHeroRef {
  x: number;
  y: number;
  flipX: boolean;
  displayWidth: number;
}

export abstract class Weapon {
  protected sprite: Phaser.GameObjects.Sprite;
  protected host: IHeroRef | null = null;
  readonly config: WeaponConfig;
  protected scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: WeaponConfig) {
    this.scene = scene;
    this.config = config;
    this.sprite = scene.add.sprite(0, 0, `weapon_${config.id}_01`);
    this.sprite.setOrigin(config.originX ?? 0.5, config.originY ?? 0.5);
    this.sprite.setScale(1.3);
    this.sprite.setVisible(false);
  }

  attach(hero: IHeroRef): void {
    this.host = hero;
    this.sprite.setVisible(true);
    this.sprite.setTexture(`weapon_${this.config.id}_01`);
    this.updateSpritePosition();
  }

  detach(): void {
    this.host = null;
    this.sprite.setVisible(false);
    this.sprite.stop();
  }

  update(): void {
    if (this.host) {
      this.updateSpritePosition();
      this.sprite.setFlipX(this.host.flipX);
      const ox = this.config.originX ?? 0.5;
      this.sprite.setOrigin(this.host.flipX ? 1 - ox : ox, this.config.originY ?? 0.5);
    }
  }

  // Position weapon sprite at a fixed offset from the hero's anchor point
  private updateSpritePosition(): void {
    if (!this.host) return;
    const offsetX = this.host.flipX ? -6 : 6;
    this.sprite.setPosition(this.host.x + offsetX, this.host.y + 10);
  }

  abstract fire(): void;

  destroy(): void {
    this.sprite.destroy();
  }
}
