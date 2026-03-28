import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { HERO_CONFIGS } from '../config/HeroConfigs';

export class GameScene extends Phaser.Scene {
  private hero!: Hero;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.hero = new Hero(this, width / 2, height / 2, HERO_CONFIGS[0]);
    this.hero.initCursors(this.input.keyboard!);
  }

  update(): void {
    this.hero.update();
  }
}
