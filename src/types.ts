import * as d3 from 'd3';

export type Nullable<T> = T | null;
export type PixelCoords = [number, number];
export type PuzzleImage = {
  file: string;
  shownFile: string;
};

export type FractionSize = 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512;

export type D3BaseSelection = d3.Selection<SVGElement, unknown, HTMLElement, unknown>;

export interface ISwiperImage {
  id: number;
  imageBlurred: string;
  imageOriginal: string;
  isCleared: boolean;
  copyrightFirst: string;
  copyrightMiddle: string;
  copyrightLast: string;
}
