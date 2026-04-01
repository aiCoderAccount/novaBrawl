import type { AttachmentPoint } from '../types';

const cache = new Map<string, AttachmentPoint>();

export function setAttachmentPoint(frameKey: string, point: AttachmentPoint): void {
  cache.set(frameKey, point);
}

export function getAttachmentPoint(frameKey: string): AttachmentPoint | undefined {
  return cache.get(frameKey);
}
