import Phaser from 'phaser';
import type { HeroConfig, HeroState } from '../types';
import type { Weapon } from './weapons/Weapon';
import { HealingEffect } from './effects/HealingEffect';
import { BUFF_CONFIGS } from '../config/BuffConfigs';

const DASH_SPEED = 400;
const JUMP_SCALE_PEAK = 2.2;

export class Hero extends Phaser.GameObjects.Container {
  readonly config: HeroConfig;

  private heroSprite: Phaser.GameObjects.Sprite;

  // Instance variables and starting values
  private currentState: HeroState = 'idle';
  private isDashing = false;
  private isJumping = false;
  private isAlive = true;
  private isShielded = false;
  private isHealing = false;
  private currentHealth = 120;
  private currentShield = 30;
  private weapons: Weapon[] = [];
  private activeWeaponIndex = 0;
  private dustSprite: Phaser.GameObjects.Sprite | null = null;
  private dustOffsetX = 0;

  // Hold reference to keys that control the hero
  private cursors: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    dash: Phaser.Input.Keyboard.Key;
    switch: Phaser.Input.Keyboard.Key;
    heal: Phaser.Input.Keyboard.Key;
    shield: Phaser.Input.Keyboard.Key;
  } | null = null;

  get health(): number {
    return this.currentHealth;
  }

  get maxHealth(): number {
    return 120;
  }

  get shield(): number {
    return this.currentShield;
  }

  get maxShield(): number {
    return 30;
  }

  get facingLeft(): boolean {
    return this.heroSprite.flipX;
  }

  get currentFrameKey(): string {
    return this.heroSprite.texture.key;
  }

  get spriteOriginX(): number {
    return this.config.originX;
  }

  get spriteOriginY(): number {
    return this.config.originY;
  }

  get spriteScale(): number {
    return this.heroSprite.scaleX;
  }

  get spriteRawWidth(): number {
    return this.heroSprite.width;
  }

  get spriteRawHeight(): number {
    return this.heroSprite.height;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, config: HeroConfig) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;

    // Hero sprite at local (0, 0) — origin anchors it to the container position
    this.heroSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, `hero_${config.id}_idle_01`);
    this.heroSprite.setOrigin(config.originX, config.originY);
    this.heroSprite.setScale(2);

    // Dust sprite at local (0, 13) — x-offset updated at dash start
    this.dustSprite = new Phaser.GameObjects.Sprite(scene, 0, 13, 'dust_dash-dust_01');
    this.dustSprite.setVisible(false);

    // Render order: dust behind, hero sprite in front
    this.add([this.dustSprite, this.heroSprite]);

    // Size the physics body — use explicit hitbox dims if provided, else full sprite
    const body = this.body as Phaser.Physics.Arcade.Body;
    const w = config.hitboxWidth ?? this.heroSprite.displayWidth;
    const h = config.hitboxHeight ?? this.heroSprite.displayHeight;
    body.setSize(w, h);
    body.setOffset(-config.originX * w, -config.originY * h);
    body.setCollideWorldBounds(true);
    console.log(`Hero physics body — size: ${body.width}x${body.height}, offset: (${body.offset.x.toFixed(1)}, ${body.offset.y.toFixed(1)})`);

    this.heroSprite.play(`hero_${config.id}_idle`, true);
  }

  initCursors(kb: Phaser.Input.Keyboard.KeyboardPlugin): void {
    this.cursors = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      dash:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      switch: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      heal:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      shield: kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
    };
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.fireWeapon(pointer));
  }

  update(): void {
    if (this.cursors) {
      this.handleMovement();
      if (Phaser.Input.Keyboard.JustDown(this.cursors.jump)) {
        this.jump();
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.dash)) {
        this.dash();
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.switch)) {
        this.switchWeapon();
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.heal)) {
        this.activateHeal();
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.shield)) {
        this.activateShield();
      }
    }
    if (this.isAlive) {
      this.weapons[this.activeWeaponIndex]?.update();

      const activeWeapon = this.weapons[this.activeWeaponIndex];
      if (!this.isShielded && !this.isHealing && activeWeapon?.config.fireRateMs && this.scene.input.activePointer.isDown) {
        activeWeapon.fire(this.scene.input.activePointer);
      }
    }
  }

  // Steering character and playing run/idle animations
  private handleMovement(): void {
    if (!this.cursors || !this.isAlive || this.isDashing) return;
    if (this.isShielded) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      return;
    }

    // Grab physics body and set up velocity variables
    const body = this.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    const speed = this.config.speed;

    // Update character speed based on keypress
    if (this.cursors.left.isDown)  vx -= speed;
    if (this.cursors.right.isDown) vx += speed;
    if (this.cursors.up.isDown)    vy -= speed;
    if (this.cursors.down.isDown)  vy += speed;

    // Flip sprite in appropriate direction
    if (vx < 0) this.heroSprite.setFlipX(true);
    else if (vx > 0) this.heroSprite.setFlipX(false);

    // Bring speed back down to 220 when moving diagonally
    if (vx !== 0 && vy !== 0) {
      const f = 1 / Math.SQRT2; // Because √(a² + b²) = c
      vx *= f;
      vy *= f;
    }
    body.setVelocity(vx, vy);

    // Allows steering character mid-jump
    if (!this.isJumping) {
      if (vx !== 0 || vy !== 0) {
        this.playAnimation('run');
      } else {
        this.playAnimation('idle');
      }
    }
  }

  playAnimation(state: HeroState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.heroSprite.play(`hero_${this.config.id}_${state}`, true);
  }

  jump(): void {
    if (this.isJumping || this.isDashing || !this.isAlive || this.isShielded) return;
    this.isJumping = true;

    const jumpAnim = this.config.anims.jump;
    const halfDuration = (jumpAnim.frameCount / jumpAnim.frameRate) * 500;

    this.playAnimation('jump');

    // Scale tween targets only the hero sprite, not the container
    this.scene.tweens.add({
      targets: this.heroSprite,
      scaleX: JUMP_SCALE_PEAK,
      scaleY: JUMP_SCALE_PEAK,
      duration: halfDuration,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    this.heroSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isJumping = false;
    });
  }

  dash(): void {
    if (this.isDashing || this.isJumping || !this.isAlive || !this.cursors || this.isShielded) return;
    this.isDashing = true;

    // Determine dash direction from held keys, falling back to facing direction
    let dirX = 0;
    let dirY = 0;
    if (this.cursors.left.isDown)       dirX = -1;
    else if (this.cursors.right.isDown) dirX =  1;
    if (this.cursors.up.isDown)         dirY = -1;
    else if (this.cursors.down.isDown)  dirY =  1;
    if (dirX === 0 && dirY === 0)       dirX = this.facingLeft ? -1 : 1;

    // Normalize speed for diagonal movement
    const body = this.body as Phaser.Physics.Arcade.Body;
    const scale = (dirX !== 0 && dirY !== 0) ? 1 / Math.SQRT2 : 1;
    body.setVelocity(dirX * DASH_SPEED * scale, dirY * DASH_SPEED * scale);

    this.playAnimation('dash');

    if (this.dustSprite) {
      this.dustOffsetX = dirX >= 0 ? -30 : 30;
      this.dustSprite.setFlipX(dirX < 0);
      this.dustSprite.setVisible(true);
      // Update local x-offset to match dash direction; y stays fixed at 13
      this.dustSprite.setPosition(this.dustOffsetX, 13);
      this.dustSprite.play('dust_dash-dust', true);
      this.dustSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.dustSprite?.setVisible(false);
      });
    }

    this.heroSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isDashing = false;
      this.currentState = 'dash'; // allow transition back to idle
      this.playAnimation('idle');
    });
  }

  die(): void {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.isJumping = false;
    this.heroSprite.setScale(2);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.currentState = 'idle';
    this.playAnimation('death');
    this.weapons[this.activeWeaponIndex]?.detach();
  }

  equipWeapons(weapons: Weapon[]): void {
    this.weapons.forEach(w => w.detach());
    this.weapons = weapons;
    this.activeWeaponIndex = 0;
    // Add all weapon sprites to the container once — they render in front of the hero sprite
    weapons.forEach(w => w.addToContainer(this));
    weapons[0]?.attach(this);
  }

  switchWeapon(): void {
    if (this.weapons.length < 2) return;
    this.weapons[this.activeWeaponIndex].detach();
    this.activeWeaponIndex = (this.activeWeaponIndex + 1) % this.weapons.length;
    this.weapons[this.activeWeaponIndex].attach(this);
  }

  fireWeapon(pointer: Phaser.Input.Pointer): void {
    if (!this.isAlive || this.isShielded || this.isHealing) return;
    this.weapons[this.activeWeaponIndex]?.fire(pointer);
  }

  private activateHeal(): void {
    if (!this.isAlive || this.isHealing) return;
    this.isHealing = true;
    const healingConfig = BUFF_CONFIGS.find(c => c.id === 'healing')!;
    new HealingEffect(this.scene, this, healingConfig);
  }

  private activateShield(): void {
    if (!this.isAlive || this.isShielded) return;
    this.isShielded = true;
    this.currentState = 'idle'; // allow transition into select
    this.playAnimation('select');
    this.heroSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isShielded = false;
      this.currentState = 'select'; // allow transition back to idle
      this.playAnimation('idle');
    });
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    const shieldAbsorb = Math.min(amount, this.currentShield);
    this.currentShield -= shieldAbsorb;
    const remainder = amount - shieldAbsorb;
    if (remainder > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - remainder);
      if (this.currentHealth === 0) this.die();
    }
  }

  heal(amount: number): void {
    this.isHealing = false;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }
}
