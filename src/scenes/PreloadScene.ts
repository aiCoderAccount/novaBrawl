import Phaser from 'phaser';
import { HERO_CONFIGS } from '../config/HeroConfigs';
import { WEAPON_CONFIGS } from '../config/WeaponConfigs';
import { BUFF_CONFIGS } from '../config/BuffConfigs';
import { DUST_CONFIGS } from '../config/DustConfigs';
import { ENEMY_CONFIGS } from '../config/EnemyConfigs';
import type { HeroState, EnemyState, EnemyAnimDef } from '../types';
import { scanHeroAttachmentPoints, scanEnemyMarkerPoints } from '../utils/AttachmentPointScanner';

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
    this.loadBarFrames();
    this.loadEnemyFrames();
    this.loadEnemyBullets();
  }

  create(): void {
    scanHeroAttachmentPoints(this, this.frameKeyMap);
    scanEnemyMarkerPoints(this, this.frameKeyMap);
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

  private loadBarFrames(): void {
    for (let i = 1; i <= 7; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`bar_green_${n}`, `assets/bars/bar1/frame_${n}.png`);
      this.load.image(`bar_blue_${n}`, `assets/bars/bar2/frame_${n}.png`);
    }
  }

  // ─── Animation registration ───────────────────────────────────────────────

  private registerAnimations(): void {
    this.registerHeroAnimations();
    this.registerDustAnimation();
    this.registerWeaponAnimations();
    this.registerEffectAnimations();
    this.registerEnemyAnimations();
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

  // ─── Enemy loading ─────────────────────────────────────────────────────────

  private loadEnemyFrames(): void {
    for (const cfg of ENEMY_CONFIGS) {
      const idUnderscored = cfg.id.replace(/-/g, '_');

      for (const [state, animDef] of Object.entries(cfg.anims) as [EnemyState, EnemyAnimDef][]) {
        const animKey = `enemy_${cfg.id}_${state}`;
        const folder = animDef.folder ?? state;
        const stateUnderscored = state.replace(/-/g, '_');
        const filePrefix = animDef.filePrefix ?? `${idUnderscored}_${stateUnderscored}`;

        for (let i = 1; i <= animDef.frameCount; i++) {
          const n = String(i).padStart(2, '0');
          const frameKey = `${animKey}_${n}`;
          const fileName = `${filePrefix}_${n}.png`;
          this.load.image(frameKey, `assets/enemies/${cfg.id}/${folder}/${fileName}`);
          this.storeKey(animKey, frameKey);
        }
      }
    }
  }

  private loadEnemyBullets(): void {
    const bulletKeys = new Set(
      ENEMY_CONFIGS.map(cfg => cfg.bulletKey).filter((k): k is string => !!k)
    );
    for (const key of bulletKeys) {
      this.load.image(key, `assets/enemies/bullets/${key}.png`);
    }
  }

  private registerEnemyAnimations(): void {
    for (const cfg of ENEMY_CONFIGS) {
      for (const [state, animDef] of Object.entries(cfg.anims) as [EnemyState, EnemyAnimDef][]) {
        const animKey = `enemy_${cfg.id}_${state}`;
        const frames = this.frameKeyMap.get(animKey);
        if (!frames) continue;

        this.anims.create({
          key: animKey,
          frames: frames.map(k => ({ key: k })),
          frameRate: animDef.frameRate,
          repeat: animDef.repeat,
        });
      }
    }
  }
}
