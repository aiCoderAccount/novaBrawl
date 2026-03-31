import Phaser from 'phaser';
import { HERO_CONFIGS } from '../config/HeroConfigs';
import { WEAPON_CONFIGS } from '../config/WeaponConfigs';
import { BUFF_CONFIGS } from '../config/BuffConfigs';
import { DUST_CONFIGS } from '../config/DustConfigs';
import type { HeroState } from '../types';

const HERO_STATES: HeroState[] = ['idle', 'run', 'jump', 'dash', 'death', 'select'];

export class PreloadScene extends Phaser.Scene {
  // Stores array of loaded animation frames for each animation
  // Built during preload() and consumed in create() 
  private frameKeyMap = new Map<string, string[]>();

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.loadHeroFrames();
    this.loadDustFrames();
    this.loadWeaponFrames();
    this.loadBullets();
    this.loadBuffFrames();
  }

  create(): void {
    this.registerAnimations();
    this.scene.start('GameScene');
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private storeKey(animKey: string, frameKey: string): void {
    if (!this.frameKeyMap.has(animKey)) {
      this.frameKeyMap.set(animKey, []);
    }
    this.frameKeyMap.get(animKey)!.push(frameKey);
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  private loadHeroFrames(): void {
    for (const cfg of HERO_CONFIGS) {
      for (const state of HERO_STATES) {
        const animKey = `hero_${cfg.id}_${state}`;

        for (let i = 1; i <= cfg.anims[state].frameCount; i++) {
          // Create frame key
          const n = String(i).padStart(2, '0');
          const frameKey = `${animKey}_${n}`;

          // Load image 
          this.load.image(frameKey, `assets/heroes/hero-${cfg.id}/${state}/${frameKey}.png`);
          this.storeKey(animKey, frameKey);
        }
      }
    }
  }

  private loadDustFrames(): void {
    for (const cfg of DUST_CONFIGS) {
      const animKey = `dust_${cfg.id}`;

      for (let i = 1; i <= cfg.frameCount; i++) {
        // Create the frame key
        const n = String(i).padStart(2, '0');
        const frameKey = `${animKey}_${n}`;

        // Load image
        const fileName = `${cfg.filePrefix ?? animKey}_${n}`;
        this.load.image(frameKey, `assets/effects/${cfg.id}/${fileName}.png`);
        this.storeKey(animKey, frameKey);
      }
    }
  }

  private loadWeaponFrames(): void {
    for (const cfg of WEAPON_CONFIGS) {
      const animKey = `weapon_${cfg.id}`;

      for (let i = 1; i <= cfg.frameCount; i++) {
        // Create the frame key
        const n = String(i).padStart(2, '0');
        const frameKey = `${animKey}_${n}`;

        // Load image
        this.load.image(frameKey, `assets/weapons/${cfg.id}/${frameKey}.png`);
        this.storeKey(animKey, frameKey);
      }
    }
  }

  private loadBullets(): void {
    for (const cfg of WEAPON_CONFIGS) {
      if (cfg.bulletFrameKey) {
        this.load.image(cfg.bulletFrameKey, `assets/weapons/bullets/${cfg.bulletFrameKey}.png`);
      }
    }
  }

  private loadBuffFrames(): void {
    for (const cfg of BUFF_CONFIGS) {
      const animKey = `effect_${cfg.id}`;

      for (let i = 1; i <= cfg.frameCount; i++) {
        // Create frame key
        const n = String(i).padStart(2, '0');
        const frameKey = `${animKey}_${n}`;

        // Load image
        this.load.image(frameKey, `assets/buffs/${cfg.id}/${frameKey}.png`);
        this.storeKey(animKey, frameKey);
      }
    }
  }

  // ─── Animation registration ───────────────────────────────────────────────

  private registerAnimations(): void {
    this.registerHeroAnimations();
    this.registerDustAnimation();
    this.registerWeaponAnimations();
    this.registerEffectAnimations();
  }

  private registerHeroAnimations(): void {
    for (const cfg of HERO_CONFIGS) {
      for (const state of HERO_STATES) {
        // Retrieve array of frames for animation
        const animKey = `hero_${cfg.id}_${state}`;
        const frames = this.frameKeyMap.get(animKey);

        if (!frames) continue;
        const animDef = cfg.anims[state];

        // Create animation
        this.anims.create({
          key: animKey,
          frames: frames.map(k => ({ key: k })),
          frameRate: animDef.frameRate,
          repeat: animDef.repeat,
        });
      }
    }
  }

  private registerDustAnimation(): void {
    for (const cfg of DUST_CONFIGS) {
      // Retrieve array frames for animation
      const animKey = `dust_${cfg.id}`;
      const frames = this.frameKeyMap.get(animKey);

      if (!frames) continue;

      // Create animation 
      this.anims.create({
        key: animKey,
        frames: frames.map(k => ({ key: k })),
        frameRate: cfg.frameRate,
        repeat: cfg.repeat,
      });
    }
  }

  private registerWeaponAnimations(): void {
    for (const cfg of WEAPON_CONFIGS) {
      // Retrieve array of frames for animation
      const animKey = `weapon_${cfg.id}`;
      const frames = this.frameKeyMap.get(animKey);

      if (!frames) continue;

      // Create animation
      this.anims.create({
        key: animKey,
        frames: frames.map(k => ({ key: k })),
        frameRate: cfg.frameRate,
        repeat: 0,
      });
    }
  }

  private registerEffectAnimations(): void {
    for (const cfg of BUFF_CONFIGS) {
      // Retrieve array of frames for animation
      const animKey = `effect_${cfg.id}`;
      const frames = this.frameKeyMap.get(animKey);

      if (!frames) continue;

      // Create animation
      this.anims.create({
        key: animKey,
        frames: frames.map(k => ({ key: k })),
        frameRate: cfg.frameRate,
        repeat: cfg.repeat,
      });
    }
  }
}
