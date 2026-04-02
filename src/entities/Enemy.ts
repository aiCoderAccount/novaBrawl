import Phaser from 'phaser';
import type { EnemyConfig, EnemyState } from '../types';
import type { Hero } from './Hero';
import { Projectile } from './projectiles/Projectile';
import { getAttachmentPoint } from '../utils/AttachmentPointCache';

const ATTACK_COOLDOWN_MS = 1800;
const SPAWN_COOLDOWN_MS = 60_000;
const PROJECTILE_SPEED = 280;
const PROJECTILE_LIFESPAN = 2200;
const HEALTH_BAR_WIDTH = 40;
const HEALTH_BAR_HEIGHT = 4;
const HEALTH_BAR_OFFSET_Y = 8;
// Allow melee hit if hero is within 1.3× attack range at strike time
const MELEE_HIT_TOLERANCE = 1.3;

export class Enemy extends Phaser.GameObjects.Container {
  readonly config: EnemyConfig;

  private sprite: Phaser.GameObjects.Sprite;
  private healthBar: Phaser.GameObjects.Graphics;
  private currentState: EnemyState = 'idle';
  private isAlive = true;
  private isAttacking = false;
  private currentHealth: number;
  private lastAttackTime = 0;
  private lastSpawnTime = 0;

  // Injected by GameScene for ranged enemies
  projectileGroup: Phaser.GameObjects.Group | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;
    this.currentHealth = config.health;

    this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 0, `enemy_${config.id}_idle_01`);
    this.sprite.setOrigin(config.originX, config.originY);
    this.sprite.setScale(config.scale);
    this.add(this.sprite);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const w = config.hitboxWidth ?? this.sprite.displayWidth;
    const h = config.hitboxHeight ?? this.sprite.displayHeight;
    body.setSize(w, h);
    body.setOffset(-config.originX * w, -config.originY * h);
    body.setCollideWorldBounds(true);

    this.healthBar = scene.add.graphics();
    this.healthBar.setDepth(50);

    this.sprite.play(`enemy_${config.id}_idle`, true);
  }

  update(hero: Hero): void {
    if (!this.isAlive) return;

    const hoverOffsetY = this.config.hoverOffsetY ?? 0;
    const targetX = hero.x;
    const targetY = hero.y + hoverOffsetY;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // For hover enemies, attack range is checked against actual hero position,
    // not the hover target — so the hit check and stop condition are consistent.
    const attackDx = hero.x - this.x;
    const attackDy = hero.y - this.y;
    const attackDist = hoverOffsetY !== 0
      ? Math.sqrt(attackDx * attackDx + attackDy * attackDy)
      : dist;

    this.sprite.setFlipX(hero.x < this.x);

    if (!this.isAttacking) {
      if (attackDist <= this.config.attackRange) {
        const onCooldown = Date.now() - this.lastAttackTime < ATTACK_COOLDOWN_MS;
        if (onCooldown) {
          // Keep tracking the hover point during cooldown so the drone stays
          // near the player instead of freezing in place.
          if (dist > 10) this.moveToward(dx, dy, dist);
          else this.stopMovement();
        } else {
          this.stopMovement();
          this.tryAttack(hero);
        }
      } else if (dist <= this.config.detectionRange) {
        this.moveToward(dx, dy, dist);
      } else {
        this.stopMovement();
        this.playState('idle');
      }
    }

    this.drawHealthBar();
  }

  private moveToward(dx: number, dy: number, dist: number): void {
    if (this.config.speed === 0) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity((dx / dist) * this.config.speed, (dy / dist) * this.config.speed);
    this.playState(this.config.anims['walk'] ? 'walk' : 'idle');
  }

  private stopMovement(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  private tryAttack(hero: Hero): void {
    const now = Date.now();
    if (now - this.lastAttackTime < ATTACK_COOLDOWN_MS) return;

    this.lastAttackTime = now;
    this.isAttacking = true;

    let attackState: EnemyState = 'attack';
    if (!this.config.anims['attack'] && this.config.anims['attack-a']) {
      if (this.config.spawnConfig && now - this.lastSpawnTime >= SPAWN_COOLDOWN_MS) {
        attackState = 'attack-b';
        this.lastSpawnTime = now;
      } else {
        attackState = 'attack-a';
      }
    }

    this.playState(attackState);

    const animDef = this.config.anims[attackState];
    if (animDef) {
      const midDelay = (animDef.frameCount / animDef.frameRate / 2) * 1000;

      if (this.config.type === 'melee') {
        // Deal damage once at animation midpoint if hero is still in range
        this.scene.time.delayedCall(midDelay, () => {
          if (!this.isAlive) return;
          const dx = hero.x - this.x;
          const dy = hero.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= this.config.attackRange * MELEE_HIT_TOLERANCE) {
            hero.takeDamage(this.config.damage);
          }
        });
      } else if (this.config.bulletKey && this.projectileGroup) {
        this.scene.time.delayedCall(midDelay, () => {
          if (this.isAlive) this.fireProjectile(hero);
        });
      }
    }

    if (attackState === 'attack-b' && this.config.spawnConfig) {
      const { enemyId, frames: spawnFrames } = this.config.spawnConfig;
      const spawned = new Set<number>();

      const onFrame = (_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
        const frameNum = frame.index + 1;  // frame.index is 0-based; spawnFrames uses 1-based
        if (spawnFrames.includes(frameNum) && !spawned.has(frameNum)) {
          spawned.add(frameNum);
          const frameKey = `enemy_${this.config.id}_attack-b_${String(frameNum).padStart(2, '0')}`;
          const marker = getAttachmentPoint(frameKey);
          if (marker) {
            const flipped = this.sprite.flipX;
            const sw = this.sprite.width;
            const sh = this.sprite.height;
            const worldX = this.x + (marker.x - sw * this.config.originX) * this.config.scale * (flipped ? -1 : 1);
            const worldY = this.y + (marker.y - sh * this.config.originY) * this.config.scale;
            this.emit('spawn-minion', enemyId, worldX, worldY);
          }
        }
      };

      this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame);
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.sprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame);
      });
    }

    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false;
      this.currentState = attackState;
      this.playState('idle');
    });
  }

  private fireProjectile(hero: Hero): void {
    if (!this.projectileGroup || !this.config.bulletKey) return;
    const proj = this.projectileGroup.get(this.x, this.y) as Projectile | null;
    if (!proj) return;

    // Fire from the configured normalized Y position on the sprite (default: visual midpoint)
    const normY = this.config.bulletOriginNormY ?? 0.5;
    const fireY = this.y + this.sprite.displayHeight * (normY - this.config.originY);
    const angle = hero.x < this.x ? 180 : 0;
    proj.launch(this.x, fireY, angle, {
      textureKey: this.config.bulletKey,
      speed: PROJECTILE_SPEED,
      damage: this.config.damage,
      lifespan: PROJECTILE_LIFESPAN,
      scale: this.config.bulletScale,
    });
  }

  private playState(state: EnemyState): void {
    if (this.currentState === state) return;
    if (!this.config.anims[state]) return;
    this.currentState = state;
    this.sprite.play(`enemy_${this.config.id}_${state}`, true);
  }

  private drawHealthBar(): void {
    const pct = this.currentHealth / this.config.health;
    const bx = this.x - HEALTH_BAR_WIDTH / 2;
    const by = this.y - this.sprite.displayHeight * this.config.originY + (this.config.healthBarOffsetY ?? 0) - HEALTH_BAR_OFFSET_Y;

    this.healthBar.clear();
    this.healthBar.fillStyle(0x333333, 0.8);
    this.healthBar.fillRect(bx, by, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);

    const color = pct > 0.5 ? 0x44dd44 : pct > 0.25 ? 0xffaa00 : 0xff3333;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(bx, by, HEALTH_BAR_WIDTH * pct, HEALTH_BAR_HEIGHT);
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    if (this.currentHealth === 0) this.die();
  }

  die(): void {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.isAttacking = false;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;

    this.healthBar.destroy();

    this.currentState = 'idle';
    if (this.config.anims['death']) {
      this.sprite.play(`enemy_${this.config.id}_death`, true);
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.destroy();
      });
    } else {
      this.destroy();
    }
  }
}
