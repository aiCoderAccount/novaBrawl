import Phaser from 'phaser';
import { HERO_CONFIGS } from '../config/HeroConfigs';
import { WEAPON_CONFIGS } from '../config/WeaponConfigs';
import { BUFF_CONFIGS } from '../config/BuffConfigs';
import { DUST_CONFIGS } from '../config/DustConfigs';
import type { HeroState } from '../types';

const HERO_STATES: HeroState[] = ['idle', 'run', 'jump', 'dash', 'death', 'select'];

export class PreloadScene extends Phaser.Scene {
  // Stores ordered texture key arrays per animation key, built during preload()
  // and consumed in create() to register Phaser animations.
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

  private storeKey(animKey: string, textureKey: string): void {
    if (!this.frameKeyMap.has(animKey)) {
      this.frameKeyMap.set(animKey, []);
    }
    this.frameKeyMap.get(animKey)!.push(textureKey);
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  private loadHeroFrames(): void {
    for (const cfg of HERO_CONFIGS) {
      for (const state of HERO_STATES) {
        const animKey = `hero_${cfg.id}_${state}`;

        for (let i = 1; i <= cfg.anims[state].frameCount; i++) {
          // Create texture key
          const n = String(i).padStart(2, '0');
          const textureKey = `hero_${cfg.id}_${state}_${n}`;

          // Load image 
          this.load.image(textureKey, `assets/heroes/hero-${cfg.id}/${state}/${textureKey}.png`);
          this.storeKey(animKey, textureKey);
        }
      }
    }
  }

  private loadDustFrames(): void {
    for (const cfg of DUST_CONFIGS) {
      const animKey = `dust_${cfg.id}`;

      for (let i = 1; i <= cfg.frameCount; i++) {
        // Create the texture key
        const n = String(i).padStart(2, '0');
        const textureKey = `${animKey}_${n}`;

        // Load image
        this.load.image(textureKey, `assets/effects/${cfg.id}/${textureKey}.png`);
        this.storeKey(animKey, textureKey);
      }
    }
  }

  private loadWeaponFrames(): void {
    for (const cfg of WEAPON_CONFIGS) {
      const animKey = `weapon_${cfg.id}`;

      for (let i = 1; i <= cfg.frameCount; i++) {
        // Create the texture key
        const n = String(i).padStart(2, '0');
        const textureKey = `weapon_${cfg.id}_${n}`;

        // Load image
        this.load.image(textureKey, `assets/weapons/${cfg.id}/${textureKey}.png`);
        this.storeKey(animKey, textureKey);
      }
    }
  }

  private loadBullets(): void {
    for (const cfg of WEAPON_CONFIGS) {
      if (cfg.bulletTextureKey) {
        this.load.image(cfg.bulletTextureKey, `assets/weapons/bullets/${cfg.bulletTextureKey}.png`);
      }
    }
  }

  private loadBuffFrames(): void {
    for (const cfg of BUFF_CONFIGS) {
      const animKey = `effect_${cfg.id}`;

      for (let i = 1; i <= cfg.frameCount; i++) {
        // Create texture key
        const n = String(i).padStart(2, '0');
        const textureKey = `effect_${cfg.id}_${n}`;

        // Load image
        this.load.image(textureKey, `assets/buffs/${cfg.id}/${textureKey}.png`);
        this.storeKey(animKey, textureKey);
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
        const animKey = `hero_${cfg.id}_${state}`;
        const frames = this.frameKeyMap.get(animKey);
        if (!frames) continue;
        const animDef = cfg.anims[state];
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
      const animKey = `dust_${cfg.id}`;
      const frames = this.frameKeyMap.get(animKey);
      if (!frames) continue;
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
      const animKey = `weapon_${cfg.id}`;
      const frames = this.frameKeyMap.get(animKey);
      if (!frames) continue;
      this.anims.create({
        key: animKey,
        frames: frames.map(k => ({ key: k })),
        frameRate: cfg.frameRate,
        repeat: -1,
      });
    }
  }

  private registerEffectAnimations(): void {
    for (const cfg of BUFF_CONFIGS) {
      const animKey = `effect_${cfg.id}`;
      const frames = this.frameKeyMap.get(animKey);
      if (!frames) continue;
      this.anims.create({
        key: animKey,
        frames: frames.map(k => ({ key: k })),
        frameRate: cfg.frameRate,
        repeat: cfg.repeat,
      });
    }
  }
}
