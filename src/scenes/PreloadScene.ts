import Phaser from 'phaser';
import { HERO_CONFIGS } from '../config/HeroConfigs';
import { WEAPON_CONFIGS } from '../config/WeaponConfigs';
import { EFFECT_CONFIGS } from '../config/EffectConfigs';
import type { HeroState } from '../types';

const HERO_STATES: HeroState[] = ['idle', 'run', 'jump', 'dash', 'death', 'select'];

const STATE_FOLDER: Record<HeroState, string> = {
  idle:   'Idle',
  run:    'Run',
  jump:   'Jump',
  dash:   'Dash',
  death:  'Death',
  select: 'Select',
};

export class PreloadScene extends Phaser.Scene {
  // Stores ordered texture key arrays per animation key, built during preload()
  // and consumed in create() to register Phaser animations.
  private frameKeyMap = new Map<string, string[]>();

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void { 
    this.loadHeroFrames();
    this.loadWeaponFrames();
    this.loadBullets();
    this.loadEffectFrames();
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
    // Loop through every Hero config and every animation for that hero
    for (const cfg of HERO_CONFIGS) {
      for (const state of HERO_STATES) {
        const animDef = cfg.anims[state];             
        const folder = STATE_FOLDER[state]; 
        
        // External and internal filenames for a state animation 
        const fileStem = `Hero-${cfg.id}-${folder}`;  
        const animKey = `hero_${cfg.id}_${state}`;

        // Loop through each frame in that animation
        for (let i = 1; i <= animDef.frameCount; i++) {
          const n = String(i).padStart(2, '0');
          const textureKey = `hero_${cfg.id}_${state}_${n}`;
          const path = `assets/heroes/Hero ${cfg.id}/${folder}/${fileStem}_${n}.png`;
          this.load.image(textureKey, path);
          this.storeKey(animKey, textureKey);
        }
      }

      const dustAnimKey = `hero_${cfg.id}_dash_dust`;
      for (let i = 1; i <= 5; i++) {
        const n = String(i).padStart(2, '0');
        const textureKey = `hero_${cfg.id}_dash_dust_${n}`;
        const path = `assets/heroes/Hero ${cfg.id}/Dash/Dust/Dash-Dust_${n}.png`;
        this.load.image(textureKey, path);
        this.storeKey(dustAnimKey, textureKey);
      }
    }
  }

  private loadWeaponFrames(): void {
    for (const cfg of WEAPON_CONFIGS) {
      const animKey = `weapon_${cfg.id}`;
      for (let i = 1; i <= cfg.frameCount; i++) {
        const textureKey = `weapon_${cfg.id}_${i}`;
        let path: string;

        if (cfg.id === 'lightsaber') {
          // Special naming: "New lightsaber01.png" (zero-padded, no underscore before number)
          const pad = String(i).padStart(2, '0');
          path = `assets/Weapons/${cfg.assetFolder}/${cfg.assetFileStem}${pad}.png`;
        } else {
          path = `assets/Weapons/${cfg.assetFolder}/${cfg.assetFileStem}_${i}.png`;
        }

        this.load.image(textureKey, path);
        this.storeKey(animKey, textureKey);
      }
    }
  }

  private loadBullets(): void {
    this.load.image('bullet_laser-beam',  'assets/Weapons/Bullets/Bullet_Laser Beam.png');
    this.load.image('bullet_laser-gun',   'assets/Weapons/Bullets/Bullet_Laser Gun.png');
    this.load.image('bullet_machinegun',  'assets/Weapons/Bullets/Bullet_MachineGun.png');
    this.load.image('bullet_shotgun',     'assets/Weapons/Bullets/Bullet_Shotgun.png');
  }

  private loadEffectFrames(): void {
    for (const cfg of EFFECT_CONFIGS) {
      const animKey = `effect_${cfg.id}`;
      for (let i = 1; i <= cfg.frameCount; i++) {
        const textureKey = `effect_${cfg.id}_${i}`;
        // Buff-1 frame 7 is uniquely zero-padded on disk (Buff-1_07.png)
        const fileNum = (cfg.id === 'buff-1' && i === 7) ? '07' : String(i);
        const path = `assets/Buffs/${cfg.assetFolder}/${cfg.assetFileStem}_${fileNum}.png`;
        this.load.image(textureKey, path);
        this.storeKey(animKey, textureKey);
      }
    }
  }

  // ─── Animation registration ───────────────────────────────────────────────

  private registerAnimations(): void {
    this.registerHeroAnimations();
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

      const dustAnimKey = `hero_${cfg.id}_dash_dust`;
      const dustFrames = this.frameKeyMap.get(dustAnimKey);
      if (dustFrames) {
        this.anims.create({
          key: dustAnimKey,
          frames: dustFrames.map(k => ({ key: k })),
          frameRate: 10,
          repeat: 0,
        });
      }
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
    for (const cfg of EFFECT_CONFIGS) {
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
