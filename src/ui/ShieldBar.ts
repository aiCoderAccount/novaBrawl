import Phaser from 'phaser';

const SEGMENTS = 6;
const HP_PER_SEGMENT = 5;
const SEGMENT_SCALE_X = 0.5;
const SEGMENT_SCALE_Y = 1.5;
const SEGMENT_GAP = 2;

export class ShieldBar extends Phaser.GameObjects.Container {
  private segments: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(100);

    for (let i = 0; i < SEGMENTS; i++) {
      const img = new Phaser.GameObjects.Image(scene, 0, 0, 'bar_blue_01');
      img.setScale(SEGMENT_SCALE_X, SEGMENT_SCALE_Y);
      img.setOrigin(0, 0);
      img.x = i * (img.width * SEGMENT_SCALE_X + SEGMENT_GAP);
      this.add(img);
      this.segments.push(img);
    }
  }

  updateShield(current: number): void {
    for (let i = 0; i < SEGMENTS; i++) {
      const segmentMin = i * HP_PER_SEGMENT;
      const hpInSegment = Math.max(0, Math.min(current - segmentMin, HP_PER_SEGMENT));
      this.segments[i].setTexture(this.frameKeyForHp(hpInSegment));
    }
  }

  private frameKeyForHp(hpInSegment: number): string {
    if (hpInSegment <= 0) return 'bar_blue_07';
    const fillIndex = Math.floor(((hpInSegment - 1) / HP_PER_SEGMENT) * 6); // 0-5
    const frameNum = String(6 - fillIndex).padStart(2, '0');
    return `bar_blue_${frameNum}`;
  }
}
