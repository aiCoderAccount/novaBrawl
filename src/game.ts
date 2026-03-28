import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

export function createGame(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    backgroundColor: '#000000',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scene: [GameScene],
    parent: document.body,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}
