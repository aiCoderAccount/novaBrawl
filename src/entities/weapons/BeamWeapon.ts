import Phaser from 'phaser';
import type { WeaponConfig } from '../../types';
import { Weapon } from './Weapon';

export class BeamWeapon extends Weapon {
  private beamImage: Phaser.GameObjects.Image;
  private glowImage: Phaser.GameObjects.Image;
  private muzzleBubble: Phaser.GameObjects.Arc;
  private isFiring = false;

  constructor(scene: Phaser.Scene, config: WeaponConfig) {
    super(scene, config);

    const textureKey = config.bulletFrameKey ?? 'bullet_laser-beam';

    this.glowImage = scene.add.image(0, 0, textureKey);
    this.glowImage.setOrigin(0, 0.5);
    this.glowImage.setVisible(false);
    this.glowImage.setDepth(9);
    this.glowImage.setAlpha(0.35);
    this.glowImage.setTint(0x00ffff);

    this.beamImage = scene.add.image(0, 0, textureKey);
    this.beamImage.setOrigin(0, 0.5);
    this.beamImage.setVisible(false);
    this.beamImage.setDepth(10);

    this.muzzleBubble = scene.add.arc(0, 0, 6, 0, 0, false, 0x00ffff, 0.04);
    this.muzzleBubble.setStrokeStyle(1.5, 0x00ffff, 1);
    this.muzzleBubble.setDepth(11);
    this.muzzleBubble.setVisible(false);
    this.muzzleBubble.postFX.addGlow(0x00ffff, 8, 0, false, 0.1, 16);
  }

  fire(_pointer: Phaser.Input.Pointer): void {
    if (!this.host || this.isFiring || !this.canFire()) return;
    this.isFiring = true;
    this.markFired();

    this.sprite.play(`weapon_${this.config.id}`, true);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.sprite.setTexture(`weapon_${this.config.id}_01`);
    });

    const localPos = this.getAttachmentLocalPosition();
    const dirSign = this.host.facingLeft ? -1 : 1;
    const muzzleX = this.host.x + (localPos?.x ?? 0) + dirSign * 15;
    const muzzleY = this.host.y + (localPos?.y ?? 17) + 4;

    const camera = this.scene.cameras.main;
    const facingLeft = this.host.facingLeft;
    const beamLength = facingLeft
      ? muzzleX - camera.scrollX
      : camera.scrollX + camera.width - muzzleX;

    const textureWidth = this.beamImage.width;
    const scaleX = beamLength / textureWidth;
    const originX = facingLeft ? 1 : 0;

    // Main beam
    this.beamImage.setPosition(muzzleX, muzzleY);
    this.beamImage.setOrigin(originX, 0.5);
    this.beamImage.setScale(scaleX, 0.5);
    this.beamImage.setFlipX(facingLeft);
    this.beamImage.setAlpha(1);
    this.beamImage.setVisible(true);

    // Glow layer — same position/origin/flip, wider on Y
    this.glowImage.setPosition(muzzleX, muzzleY);
    this.glowImage.setOrigin(originX, 0.5);
    this.glowImage.setScale(scaleX, 1);
    this.glowImage.setFlipX(facingLeft);
    this.glowImage.setAlpha(0.35);
    this.glowImage.setVisible(true);

    // Muzzle bubble — 230° arc opening toward the firing direction
    const arcCenter = facingLeft ? 180 : 0;
    this.muzzleBubble.setStartAngle(arcCenter - 115);
    this.muzzleBubble.setEndAngle(arcCenter + 115);
    this.muzzleBubble.setPosition(muzzleX, muzzleY);
    this.muzzleBubble.setScale(1);
    this.muzzleBubble.setAlpha(1);
    this.muzzleBubble.setVisible(true);
    this.scene.tweens.add({
      targets: this.muzzleBubble,
      scale: 3,
      alpha: 0,
      duration: 180,
      ease: 'Sine.easeOut',
      onComplete: () => { this.muzzleBubble.setVisible(false); },
    });

    // PostFX bloom on the core beam
    const glowFx = this.beamImage.postFX.addGlow(0x00ffff, 6, 0, false, 0.1, 16);

    // scaleY pulse — gives the beam a living, energetic flicker
    const pulseTween = this.scene.tweens.add({
      targets: this.beamImage,
      scaleY: { value: 0.65, duration: 80, ease: 'Sine.easeInOut' },
      yoyo: true,
      repeat: -1,
    });

    // Speed slightly above hero run speed (220 px/s)
    const RECESSION_SPEED = 800; // px/s
    const fadeMs = (beamLength / RECESSION_SPEED) * 1000;

    const farX = facingLeft ? muzzleX - beamLength : muzzleX + beamLength;
    const farOriginX = facingLeft ? 0 : 1;

    // Reanchor both images to the far end so they shrink from the muzzle outward
    this.beamImage.setOrigin(farOriginX, 0.5);
    this.beamImage.setPosition(farX, muzzleY);
    this.glowImage.setOrigin(farOriginX, 0.5);
    this.glowImage.setPosition(farX, muzzleY);

    this.scene.tweens.add({
      targets: this.beamImage,
      scaleX: { value: 0, duration: fadeMs, ease: 'Linear' },
      alpha: { value: 0, delay: 150, duration: 220, ease: 'Linear' },
      onComplete: () => {
        pulseTween.stop();
        this.beamImage.postFX.remove(glowFx);
        this.beamImage.setVisible(false);
        this.beamImage.setScale(scaleX, 0.5);
        this.beamImage.setAlpha(1);
        this.isFiring = false;
      },
    });

    this.scene.tweens.add({
      targets: this.glowImage,
      scaleX: { value: 0, duration: fadeMs, ease: 'Linear' },
      alpha: { value: 0, delay: 150, duration: 220, ease: 'Linear' },
      onComplete: () => {
        this.glowImage.setVisible(false);
        this.glowImage.setScale(scaleX, 1);
        this.glowImage.setAlpha(0.35);
      },
    });
  }

  destroy(): void {
    this.muzzleBubble.destroy();
    this.glowImage.destroy();
    this.beamImage.destroy();
    super.destroy();
  }
}
