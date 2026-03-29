import Phaser from 'phaser';
import type { HeroConfig, HeroState } from '../types';
import type { Weapon } from './weapons/Weapon';

const DASH_SPEED = 550;

export class Hero extends Phaser.Physics.Arcade.Sprite {
  readonly config: HeroConfig;

  private currentState: HeroState = 'idle';
  private isDashing = false;
  private isAlive = true;
  private equippedWeapon: Weapon | null = null;
  private dustSprite: Phaser.GameObjects.Sprite | null = null;

  private cursors: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  } | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: HeroConfig) {
    const firstIdleKey = `hero_${config.id}_idle_01`;
    super(scene, x, y, firstIdleKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;
    this.setOrigin(config.originX, config.originY);
    this.setScale(2.5);
    (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    this.dustSprite = scene.add.sprite(x, y, `hero_${config.id}_dash_dust_01`);
    this.dustSprite.setVisible(false);

    this.play(`hero_${config.id}_idle`, true);
  }

  initCursors(kb: Phaser.Input.Keyboard.KeyboardPlugin): void {
    this.cursors = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(): void {
    if (this.cursors) {
      this.handleMovement();
    }
    this.equippedWeapon?.update();
    this.dustSprite?.setPosition(this.x, this.y);
  }

  private handleMovement(): void {
    if (!this.cursors || !this.isAlive || this.isDashing) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    const speed = this.config.speed;

    if (this.cursors.left.isDown)  vx -= speed;
    if (this.cursors.right.isDown) vx += speed;
    if (this.cursors.up.isDown)    vy -= speed;
    if (this.cursors.down.isDown)  vy += speed;

    if (vx !== 0 && vy !== 0) {
      const f = 1 / Math.SQRT2;
      vx *= f;
      vy *= f;
    }

    body.setVelocity(vx, vy);

    if (vx < 0) this.setFlipX(true);
    else if (vx > 0) this.setFlipX(false);

    if (vx !== 0 || vy !== 0) {
      this.playAnimation('run');
    } else {
      this.playAnimation('idle');
    }
  }

  playAnimation(state: HeroState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.play(`hero_${this.config.id}_${state}`, true);
  }

  dash(directionX: number): void {
    if (this.isDashing || !this.isAlive) return;
    this.isDashing = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(directionX * DASH_SPEED);
    this.setFlipX(directionX < 0);

    this.currentState = 'idle'; // allow transition
    this.playAnimation('dash');

    if (this.dustSprite) {
      this.dustSprite.setVisible(true).setPosition(this.x, this.y);
      this.dustSprite.play(`hero_${this.config.id}_dash_dust`, true);
      this.dustSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.dustSprite?.setVisible(false);
      });
    }

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isDashing = false;
      this.currentState = 'dash'; // allow transition back to idle
      this.playAnimation('idle');
    });
  }

  die(): void {
    if (!this.isAlive) return;
    this.isAlive = false;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.currentState = 'idle'; // allow transition
    this.playAnimation('death');
  }

  equipWeapon(weapon: Weapon): void {
    this.equippedWeapon?.detach();
    this.equippedWeapon = weapon;
    weapon.attach(this);
  }

  fireWeapon(): void {
    this.equippedWeapon?.fire();
  }

  heal(amount: number): void {
    // Health management to be expanded when game state is added
    void amount;
  }
}

