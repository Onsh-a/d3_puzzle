import { Nullable } from '@/types.ts';

export function getOffset(selector: string | null) {
  if (!selector) return null;
  const element = document.querySelector(selector);
  if (!element) throw new Error('Wrapper element not found');
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

export function getChildrenPaths(currentSuze: number, x: number, y: number): string[] {
  const result: string[] = [];
  const step = currentSuze;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const xPosition = x * step + i * (step / 2);
      const yPosition = y * step + j * (step / 2);
      result.push(`${xPosition}~${yPosition}`);
    }
  }
  return result;
}

export function getPixelNode (x: Nullable<number> = null, y: Nullable<number> = null, size:Nullable<number> = null) {
  return document.querySelector(`rect[x="${x}"][y="${y}"][width="${size}"]`) as HTMLElement || null;
}

export const MAX_IMAGE_WIDTH = 512;

export const PUZZLE_TARGET_ELEMENTS = ['svg', 'rect'];
