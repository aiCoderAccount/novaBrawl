import Phaser from 'phaser';
import type { BuffConfig } from '../../types';
import { Effect, type IEffectTarget } from './Effect';

export class Buff extends Effect {
  private target: IEffectTarget;

  constructor(scene: Phaser.Scene, target: IEffectTarget, config: BuffConfig) {
    super(scene, target.x, target.y, config);
    this.target = target;
    this.playEffect();
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.onComplete, this);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.setPosition(this.target.x, this.target.y - this.target.displayHeight / 2);
  }

  onComplete(): void {
    if (this.config.repeat === 0) {
      this.destroy();
    }
  }
}
