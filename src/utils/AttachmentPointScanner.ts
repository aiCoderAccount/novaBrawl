import Phaser from 'phaser';
import { setAttachmentPoint } from './AttachmentPointCache';

// The purple marker color placed in hero frames to indicate weapon attachment points
const MARKER_R = 231;
const MARKER_G = 49;
const MARKER_B = 221;

// Hero states where a missing marker is expected (weapon is hidden)
const SILENT_STATES = new Set(['death', 'select']);

/**
 * Scans every hero animation frame in frameKeyMap for the purple pixel marker
 * (RGB 231, 49, 221) and stores the found coordinates in the attachment point cache.
 * Must be called in PreloadScene.create() after all images are loaded.
 */
export function scanHeroAttachmentPoints(
  scene: Phaser.Scene,
  frameKeyMap: Map<string, string[]>,
): void {
  for (const [animKey, frameKeys] of frameKeyMap) {
    if (!animKey.startsWith('hero_')) continue;

    // Determine if missing markers should be silent (death/select states)
    const state = animKey.split('_').pop() ?? '';
    const silent = SILENT_STATES.has(state);

    for (const frameKey of frameKeys) {
      const found = scanFrame(scene, frameKey);
      if (!found && !silent) {
        console.warn(`[AttachmentPointScanner] No marker found in frame: ${frameKey}`);
      }
    }
  }
}

function scanFrame(scene: Phaser.Scene, frameKey: string): boolean {
  const texture = scene.textures.get(frameKey);
  if (!texture) return false;

  const source = texture.getSourceImage() as HTMLImageElement;
  if (!source) return false;

  const w = source.naturalWidth || source.width;
  const h = source.naturalHeight || source.height;
  if (w === 0 || h === 0) return false;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === MARKER_R && data[i + 1] === MARKER_G && data[i + 2] === MARKER_B && data[i + 3] > 0) {
      const pixelIndex = i / 4;
      setAttachmentPoint(frameKey, {
        x: pixelIndex % w,
        y: Math.floor(pixelIndex / w),
      });

      // Erase the marker pixel so it doesn't render in-game
      data[i + 3] = 0;
      ctx.putImageData(imageData, 0, 0);
      scene.textures.remove(frameKey);
      scene.textures.addCanvas(frameKey, canvas);

      return true;
    }
  }

  return false;
}
