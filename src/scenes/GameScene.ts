import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { HERO_CONFIGS } from '../config/HeroConfigs';
import { WEAPON_CONFIGS } from '../config/WeaponConfigs';
import { ENEMY_CONFIGS } from '../config/EnemyConfigs';
import { MeleeWeapon } from '../entities/weapons/MeleeWeapon';
import { RangedWeapon } from '../entities/weapons/RangedWeapon';
import { BeamWeapon } from '../entities/weapons/BeamWeapon';
import { Projectile } from '../entities/projectiles/Projectile';
import { HealthBar } from '../ui/HealthBar';
import { ShieldBar } from '../ui/ShieldBar';
import type { WeaponConfig } from '../types';
import type { Weapon } from '../entities/weapons/Weapon';

// Spawn positions per enemy id
const ENEMY_SPAWNS: Record<string, [number, number]> = {
  'common-melee':   [160, 130],
  'elite-flame':    [800, 130],
  'drone-pod':      [160, 510],
  'hen-mini-drone': [800, 510],
  'special-walker': [130, 320],
  'boss-hen':       [830, 320],
};

function createWeapon(scene: Phaser.Scene, config: WeaponConfig): Weapon {
  if (config.type === 'melee') return new MeleeWeapon(scene, config);
  if (config.type === 'beam') return new BeamWeapon(scene, config);
  return new RangedWeapon(scene, config);
}

export class GameScene extends Phaser.Scene {
  private hero!: Hero;
  private enemies: Enemy[] = [];
  private heroWeapons: Weapon[] = [];
  private enemyProjectileGroup!: Phaser.GameObjects.Group;
  private healthBar!: HealthBar;
  private shieldBar!: ShieldBar;
  private damageKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // ── Hero ──────────────────────────────────────────────────────────────────
    this.hero = new Hero(this, width / 2, height / 2, HERO_CONFIGS[0]);
    this.hero.initCursors(this.input.keyboard!);

    const laserGun = createWeapon(this, WEAPON_CONFIGS.find(c => c.id === 'laser-gun')!);
    const machineGun = createWeapon(this, WEAPON_CONFIGS.find(c => c.id === 'machine-gun')!);
    this.heroWeapons = [laserGun, machineGun];
    this.hero.equipWeapons(this.heroWeapons);

    // ── UI ────────────────────────────────────────────────────────────────────
    this.healthBar = new HealthBar(this, 16, 16);
    this.healthBar.updateHealth(this.hero.health);
    this.shieldBar = new ShieldBar(this, 16, 35);
    this.shieldBar.updateShield(this.hero.shield);
    this.damageKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    // ── Enemy projectile pool ─────────────────────────────────────────────────
    this.enemyProjectileGroup = this.add.group({
      classType: Projectile,
      runChildUpdate: true,
    });

    // ── Collision: hero projectiles → enemies ─────────────────────────────────
    // Registered once; Phaser re-evaluates this.enemies by reference each frame,
    // so enemies added later via delayedCall are automatically included.
    for (const weapon of this.heroWeapons) {
      if (weapon instanceof RangedWeapon) {
        this.physics.add.overlap(
          weapon.projectiles,
          this.enemies,
          (projObj, enemyObj) => {
            const proj = projObj as Projectile;
            const enemy = enemyObj as Enemy;
            if (!proj.active) return;
            proj.deactivate();
            enemy.takeDamage(proj.getDamage());
          },
        );
      }
    }

    // ── Spawn enemies one at a time with a delay between each ─────────────────
    const SPAWN_DELAY_MS = 1500;
    ENEMY_CONFIGS.filter(cfg => cfg.id === 'boss-hen').forEach((cfg, index) => {
      const spawn = ENEMY_SPAWNS[cfg.id];
      if (!spawn) return;

      this.time.delayedCall(index * SPAWN_DELAY_MS, () => {
        const enemy = new Enemy(this, spawn[0], spawn[1], cfg);
        if (cfg.type !== 'melee') {
          enemy.projectileGroup = this.enemyProjectileGroup;
        }
        this.spawnEnemy(enemy);
      });
    });

    // ── Collision: hero projectiles → newly spawned enemies ──────────────────
    // (handled by existing overlaps since this.enemies is shared by reference)

    // ── Collision: enemy projectiles → hero ───────────────────────────────────
    this.physics.add.overlap(
      this.enemyProjectileGroup,
      this.hero,
      (projObj) => {
        const proj = projObj as Projectile;
        if (!proj.active) return;
        proj.deactivate();
        this.hero.takeDamage(proj.getDamage());
      },
    );
  }

  private spawnEnemy(enemy: Enemy): void {
    enemy.on('spawn-minion', (enemyId: string, x: number, y: number) => {
      const cfg = ENEMY_CONFIGS.find(c => c.id === enemyId);
      if (!cfg) return;
      const minion = new Enemy(this, x, y, cfg);
      if (cfg.type !== 'melee') {
        minion.projectileGroup = this.enemyProjectileGroup;
      }
      this.spawnEnemy(minion);
    });
    this.enemies.push(enemy);
  }

  update(): void {
    this.hero.update();
    this.healthBar.updateHealth(this.hero.health);
    this.shieldBar.updateShield(this.hero.shield);

    for (const enemy of this.enemies) {
      if (enemy.active) enemy.update(this.hero);
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].active) this.enemies.splice(i, 1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.damageKey)) {
      this.hero.takeDamage(15);
    }
  }
}
