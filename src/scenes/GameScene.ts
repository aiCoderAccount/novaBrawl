import Phaser from 'phaser';

const PLAYER_SPEED = 220;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.player = this.add.rectangle(width / 2, height / 2, 32, 32, 0x00e5ff);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    const kb = this.input.keyboard!;
    this.cursors = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown)  vx -= PLAYER_SPEED;
    if (this.cursors.right.isDown) vx += PLAYER_SPEED;
    if (this.cursors.up.isDown)    vy -= PLAYER_SPEED;
    if (this.cursors.down.isDown)  vy += PLAYER_SPEED;

    if (vx !== 0 && vy !== 0) {
      const f = 1 / Math.SQRT2;
      vx *= f;
      vy *= f;
    }

    body.setVelocity(vx, vy);
  }
}
