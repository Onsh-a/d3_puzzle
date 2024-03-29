import * as d3 from 'd3';
import { D3BaseSelection, Nullable } from '@/types.ts';
import { getPixelNode } from '@/helpers/puzzle.ts';

export default class Pixel {
  parent: Nullable<Pixel> = null;
  node: Nullable<HTMLElement> = null;
  minSizeFractions = 16;
  container: Nullable<D3BaseSelection> = null;
  x: Nullable<number> = null;
  y: Nullable<number> = null;
  rgb: Nullable<d3.RGBColor> = null;
  size: Nullable<number> = null;
  color: Nullable<number[]> = null;
  children: Nullable<Pixel[]> = null;
  onSplitCallback;

  constructor(
    container: Nullable<D3BaseSelection>,
    xi: number,
    yi: number,
    size: number,
    color: number[],
    children?: Pixel[],
    minSizeFractions?: number,
    onSplitCallback?: (arg: number) => void
  ) {
    this.container = container;
    this.x = size * xi;
    this.y = size * yi;
    this.size = size;
    this.color = color || null;
    this.rgb = d3.rgb(color[0], color[1], color[2]);
    this.children = children || null;
    this.minSizeFractions = minSizeFractions || 16;
    this.onSplitCallback = onSplitCallback;
  }

  isSplitable() {
    return !!(this.node && this.children && this.children.length);
  }

  splitThisPixel() {
    if (!this.isSplitable() || !this.size) return;
    if (!this.children || this.size < this.minSizeFractions) return;

    if (this.parent?.node) {
      this.parent?.node?.classList.add('hidden');
      this.parent.node = null;
      if (this.onSplitCallback) this.onSplitCallback(this.parent?.size || 0);
    }

    if (this.size === this.minSizeFractions) {
      this.node?.classList.add('hidden');
      this.node = null;
      if (this.onSplitCallback) this.onSplitCallback(this.size || 0);
      return;
    }

    this.renderChildren(this.children);
  }

  renderChildren(pixels: Pixel[]) {
    if (!this.container) return;
    // @ts-ignore
    let pixel = this.container.selectAll('.nope').data(pixels).enter().append('rect') as any;

    pixel = pixel
      .attr('x', (pixelInstance: Pixel) => {
        if (!pixelInstance?.parent || !pixelInstance.parent.size) return;
        return pixelInstance.parent.x || pixelInstance.parent.size || 0 / 2;
      })
      .attr('y', (pixelInstance: Pixel) => {
        if (!pixelInstance?.parent || !pixelInstance.parent.size) return;
        return pixelInstance.parent.y || pixelInstance.parent.size || 0 / 2;
      })
      .attr('wipixelInstanceth', (pixelInstance: Pixel) => pixelInstance.size)
      .attr('height', (pixelInstance: Pixel) => pixelInstance.size)
      .attr('fill', (pixelInstance: Pixel) => {
        if (!pixelInstance?.parent) return;
        return String(pixelInstance.parent.rgb);
      })
      .attr('fill-opacity', 0.7);

    // Transition the to the respective final state
    pixel
      .attr('x', (pixelInstance: Pixel) => pixelInstance.x)
      .attr('y', (pixelInstance: Pixel) => pixelInstance.y)
      .attr('width', (pixelInstance: Pixel) => pixelInstance.size)
      .attr('height', (pixelInstance: Pixel) => pixelInstance.size)
      .attr('fill', (pixelInstance: Pixel) => String(pixelInstance.rgb))
      .attr('fill-opacity', 1)
      .each((pixelInstance: Pixel) => {
        pixelInstance.node = getPixelNode(pixelInstance.x, pixelInstance.y, pixelInstance.size);
      });
  }

  static addFirstPixelLayer(container: D3BaseSelection, pixels: Pixel[]) {
    if (!container) return;
    let pixel = container
      .selectAll('.nope')
      .data(pixels)
      .enter()
      .append('rect');

    pixel = pixel
      .attr('x', (pixelInstance: Pixel) => pixelInstance?.x)
      .attr('y', (pixelInstance: Pixel) => pixelInstance?.y)
      .attr('width', (pixelInstance: Pixel) => pixelInstance?.size)
      .attr('height', (pixelInstance: Pixel) => pixelInstance?.size)
      .attr('fill', '#ffffff');

    // Transition the to the respective final state
    pixel
      .attr('x', (pixelInstance: Pixel) => pixelInstance?.x)
      .attr('y', (pixelInstance: Pixel) => pixelInstance?.y)
      .attr('width', (pixelInstance: Pixel) => pixelInstance?.size)
      .attr('height', (pixelInstance: Pixel) => pixelInstance?.size)
      .attr('fill', (pixelInstance: Pixel) => String(pixelInstance?.rgb))
      .attr('fill-opacity', 1)
      .each((pixelInstance: Pixel) => {
        pixelInstance.node = getPixelNode(pixelInstance.x, pixelInstance.y, pixelInstance.size);
      });
  }
}
