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
    this.sprite = scene.add.sprite(0, 0, `weapon_${config.id}_1`);
    this.sprite.setVisible(false);
  }

  attach(hero: IHeroRef): void {
    this.host = hero;
    this.sprite.setVisible(true);
    this.sprite.play(`weapon_${this.config.id}`, true);
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
    }
  }

  private updateSpritePosition(): void {
    if (!this.host) return;
    const offsetX = this.host.flipX
      ? -(this.host.displayWidth / 2 + 8)
      : this.host.displayWidth / 2 + 8;
    this.sprite.setPosition(this.host.x + offsetX, this.host.y);
  }

  abstract fire(): void;

  destroy(): void {
    this.sprite.destroy();
  }
}
