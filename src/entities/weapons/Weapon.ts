import Phaser from 'phaser';
import type { WeaponConfig } from '../../types';
import { getAttachmentPoint } from '../../utils/AttachmentPointCache';

export interface IHeroRef {
  x: number;
  y: number;
  facingLeft: boolean;
  currentFrameKey: string;
  spriteOriginX: number;
  spriteOriginY: number;
  spriteScale: number;
  spriteRawWidth: number;
  spriteRawHeight: number;
}

export abstract class Weapon {
  protected sprite: Phaser.GameObjects.Sprite;
  protected host: IHeroRef | null = null;
  readonly config: WeaponConfig;
  protected scene: Phaser.Scene;
  private lastFiredAt = 0;

  constructor(scene: Phaser.Scene, config: WeaponConfig) {
    this.scene = scene;
    this.config = config;
    // Create sprite without adding to scene display list — added as a container child via addToContainer()
    this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 10, `weapon_${config.id}_01`);
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

  // Returns the container-local position of the attachment point for the current frame,
  // accounting for origin, scale, and facing direction. Returns null if no marker is cached.
  protected getAttachmentLocalPosition(): { x: number; y: number } | null {
    if (!this.host) return null;
    const point = getAttachmentPoint(this.host.currentFrameKey);
    if (!point) return null;

    const ox = this.host.spriteOriginX;
    const oy = this.host.spriteOriginY;
    const rawW = this.host.spriteRawWidth;
    const rawH = this.host.spriteRawHeight;
    const s = this.host.spriteScale;

    const xOffset = (point.x - ox * rawW) * s;
    const localX = this.host.facingLeft ? -xOffset : xOffset;
    const localY = (point.y - oy * rawH) * s;

    return { x: localX, y: localY };
  }

  // Sync local position and flip to match the hero's current animation frame marker
  update(): void {
    if (this.host) {
      const pos = this.getAttachmentLocalPosition();
      const offsetX = this.config.offsetX ?? 0;
      if (pos) {
        this.sprite.setPosition(pos.x + offsetX, pos.y + 2);
      } else {
        this.sprite.setPosition(offsetX, 12);
      }
      this.sprite.setFlipX(this.host.facingLeft);
    }
  }

  canFire(): boolean {
    const rate = this.config.fireRateMs;
    if (!rate) return true;
    return Date.now() - this.lastFiredAt >= rate;
  }

  markFired(): void {
    this.lastFiredAt = Date.now();
  }

  abstract fire(pointer: Phaser.Input.Pointer): void;

  destroy(): void {
    this.sprite.destroy();
  }
}
