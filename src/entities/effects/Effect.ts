import Phaser from 'phaser';
import type { EffectConfig } from '../../types';

export interface IEffectTarget {
  x: number;
  y: number;
  displayHeight: number;
  heal?(amount: number): void;
}

export abstract class Effect extends Phaser.GameObjects.Sprite {
  readonly config: EffectConfig;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EffectConfig) {
    super(scene, x, y, `effect_${config.id}_1`);
    scene.add.existing(this);
    this.config = config;
  }

  playEffect(ignoreIfPlaying = false): this {
    return this.play(`effect_${this.config.id}`, ignoreIfPlaying);
  }

  abstract onComplete(): void;
}
