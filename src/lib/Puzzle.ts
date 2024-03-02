import * as d3 from 'd3';
import Pixel from '@/lib/Pixel.ts';
import { getChildrenPaths, getOffset, PUZZLE_TARGET_ELEMENTS, MAX_IMAGE_WIDTH } from '@/helpers/puzzle.js';
import { Nullable, PuzzleImage, PixelCoords, D3BaseSelection, FractionSize } from '@/types.ts';

export default class Puzzle {
  maxSizeFractions: FractionSize = 32;
  minSizeFractions: FractionSize = 16;
  wrapperSVGElement: Nullable<D3BaseSelection> = null;
  prevMousePosition: Nullable<[number, number]> = null;
  prevTouchPosition: Nullable<[number, number]> = null;
  totalPixelsCount: number = 0;
  totalSplitedCount: number = 0;
  percentOpened: number = 0;
  maxSize: Nullable<number> = null;
  minPixelSize: Nullable<number> = null;
  dim: Nullable<number> = null;
  imagePath: Nullable<string> = null;
  containerSelector: Nullable<string> = null;
  offset: Nullable<{ left: number; top: number }> | null = null;
  splitedLastSecond: number = 0;
  isComplete: boolean = false;
  wasPuzzleInteracted: boolean = false;
  image: Nullable<PuzzleImage> = null;
  colorMatrix: Nullable<Uint8ClampedArray> = null;
  mapPixel: Map<string, Map<string, Pixel>> = new Map();
  bottomLayer: Map<string, Pixel> | null = null;
  percentToCompletePuzzle: number = 95;
  constructor(
    maxSize: number,
    minSize: number,
    imagePath: string,
    containerSelector: string,
  ) {
    this.maxSize = maxSize;
    this.minPixelSize = minSize;
    this.dim = this.maxSize / this.minPixelSize;
    this.imagePath = imagePath;
    this.containerSelector = containerSelector;
  }

  static isCanvasSupported() {
    const elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  }

  static isSVGSupported() {
    return (
      !!document.createElementNS &&
      !!document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        .createSVGRect
    );
  }

  static getMaxImageSize() {
    const possibleMaxSize = window.innerWidth >= MAX_IMAGE_WIDTH ?
      window.innerHeight < 800 ? window.innerHeight - 120 > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH : window.innerHeight - 120 : MAX_IMAGE_WIDTH :
      window.innerWidth;
    return possibleMaxSize >= MAX_IMAGE_WIDTH ? possibleMaxSize : possibleMaxSize % 2 === 0 ? possibleMaxSize - 6 : possibleMaxSize - 5
  }

  public loadImage() {
    const location = document.location;
    const file = `${this.imagePath}`;
    this.image = {
      file: file,
      shownFile: location.protocol + '//' + location.host + location.pathname + file
    };
  }

  // extracts the pixel data from the same area of canvas
  public getColorMatrix(loadedImage: HTMLImageElement | null): void {
    if (!loadedImage) throw new Error('Image was not found');
    const canvas = document.createElement('canvas');
    if (!canvas || !this.dim)
      throw new Error('Canvas is not available or dimension hasn not been set');
    canvas.width = this.dim;
    canvas.height = this.dim;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('HTML canvas failed to provide context');
    context.drawImage(loadedImage, 0, 0, this.dim, this.dim);
    this.colorMatrix = context.getImageData(0, 0, this.dim, this.dim).data;
  }

  public getImagePath() {
    if (!this.image) return null;
    return this.image.file;
  }

  public getCoverage() {
    return this.percentOpened ? this.percentOpened : 0;
  }

  public getClearSpeed() {
    return this.splitedLastSecond ? this.splitedLastSecond : 0;
  }

  public setPixels() {
    this._setWrapperSVGElement();
    if (!this.colorMatrix || this.colorMatrix.length < 1) {
      throw new Error('Failed to load SVG color matrix');
    }

    this._calculatePuzzleBaseLayer();

    let localSplitedThisSecond = 0;

    // интервал для рассчета скорости пикселей в секунду
    const speedCountInterval = setInterval(() => {
      this.splitedLastSecond = localSplitedThisSecond;
      localSplitedThisSecond = 0;
    }, 1000);

    // коллбек на очищение пикселя
    const onSplitCallback = (splitedElementsCount: number) => {
      this.totalSplitedCount += splitedElementsCount;
      localSplitedThisSecond += splitedElementsCount;
      this.percentOpened = Math.floor((this.totalSplitedCount / this.totalPixelsCount) * 100);

      if (this.percentOpened >= this.percentToCompletePuzzle) {
        this.isComplete = true;
        this.wrapperSVGElement?.selectAll('rect')?.remove();
        this.percentOpened = 100;
        clearInterval(speedCountInterval);
      }
    };

    // Build up successive nodes by grouping
    let yi = 0;
    let xi = 0;
    let size = this.minPixelSize || 2;
    let currentLayerCount = 1;
    let localDim = this.dim as number;
    while (size < this.maxSizeFractions) {
      size = size * 2;
      localDim /= 2;
      this.mapPixel.set(`layer_${currentLayerCount}`, new Map());
      const currentLayer: Map<string, Pixel> | undefined = this.mapPixel.get(
        `layer_${currentLayerCount}`,
      );
      const previousLayer: Map<string, Pixel> | undefined = this.mapPixel.get(
        `layer_${currentLayerCount - 1}`,
      );
      if (!currentLayer) return;
      for (yi = 0; yi < localDim; yi++) {
        for (xi = 0; xi < localDim; xi++) {
          const paths = getChildrenPaths(size, xi, yi);
          const children: Pixel[] = [];
          for (const path of paths) {
            const child = previousLayer?.get(path);
            if (child instanceof Pixel) {
              children.push(child);
            }
          }
          const color = this._getAverageColor(
            ...children.map((child) => child?.color || [0, 0, 0]),
          );
          const pixel = new Pixel(
            this.wrapperSVGElement,
            xi,
            yi,
            size,
            color,
            children,
            this.minSizeFractions,
            onSplitCallback,
          );
          pixel?.children?.forEach((child) => (child.parent = pixel));
          currentLayer.set(`${xi * size}~${yi * size}`, pixel);
        }
      }
      if (this.minSizeFractions <= size) { // calculate the total pixels count for rendered layers
        this.totalPixelsCount += currentLayer.size * size;
      }
      currentLayerCount++;
    }

    this._renderInitialImage(this.mapPixel.size - 1);
    this._initializeInteraction();
  }

  private _initializeInteraction() {
    if (!this.containerSelector) return;
    this.offset = getOffset(this.containerSelector);
    d3.select(this.containerSelector).on('mouseout.puzzle', this._handleMouseOut.bind(this));
    d3.select(this.containerSelector).on('mousemove.puzzle', this._handleMouseMove.bind(this));
    d3.select(document.body).on('touchmove.puzzle', this._handleTouch.bind(this));
  }

  private _renderInitialImage(layerIndex: number) {
    if (!this.mapPixel.has(`layer_${layerIndex}`))
      throw new Error('layer does not exist');
    const pixels = this.mapPixel.get(`layer_${layerIndex}`);
    const primeLayer: Pixel[] = [];
    pixels?.forEach((value) => {
      primeLayer.push(value);
    });
    if (!this.wrapperSVGElement) return;
    Pixel.addFirstPixelLayer(this.wrapperSVGElement, [...primeLayer]);
  }

  private _calculatePuzzleBaseLayer(): void {
    if (!this.maxSize || !this.minPixelSize || !this.dim || !this.colorMatrix) {
      throw new Error('Failed to calculate layers, not enough data provided');
    }

    const size = this.minPixelSize;

    // build the pixel map
    let xi = 0;
    let yi = 0;
    let t = 0;
    this.mapPixel.set('layer_0', new Map());
    let color;
    this.bottomLayer = this.mapPixel.get('layer_0') as Map<string, Pixel>;
    for (yi = 0; yi < this.dim; yi++) {
      for (xi = 0; xi < this.dim; xi++) {
        color = [
          this.colorMatrix[t],
          this.colorMatrix[t + 1],
          this.colorMatrix[t + 2],
        ];
        this.bottomLayer.set(
          `${xi * size}~${yi * size}`,
          new Pixel(
            this.wrapperSVGElement,
            xi,
            yi,
            size,
            color,
            undefined,
            this.minSizeFractions,
          ),
        );
        t += 4; // 4 channels of rgba
      }
    }
  }

  private _handleMouseMove(event: MouseEvent) {
    if (this.isComplete) return;
    const mousePosition = d3.pointer(event);
    if (isNaN(mousePosition[0])) {
      this.prevMousePosition = null;
      return;
    }
    if (this.prevMousePosition) {
      this._findPixelAndSplit(this.prevMousePosition, mousePosition);
    }
    this.prevMousePosition = mousePosition;
    event.preventDefault();
  }

  private _handleMouseOut(event: MouseEvent & { toElement: HTMLElement }) {
    if (this.isComplete) return;
    if (PUZZLE_TARGET_ELEMENTS.includes(event.toElement.nodeName.toLowerCase())) return;
    this.prevMousePosition = null;
  }

  private _handleTouch(event: TouchEvent) {
    if (!this.offset || this.isComplete) return;
    const { clientX, clientY } = event.touches[0];
    const touchPosition = [
      clientX - (this.offset?.left || 0),
      clientY - (this.offset?.top || 0),
    ] as PixelCoords;
    if (isNaN(touchPosition[0])) {
      this.prevTouchPosition = null;
      return;
    }
    if (this.prevTouchPosition) {
      this._findPixelAndSplit(this.prevTouchPosition, touchPosition);
    }
    this.prevTouchPosition = touchPosition;
  }

  private _splitablePixelAt(position: PixelCoords) {
    if (!this.minPixelSize || !this.bottomLayer) return;
    const [x, y] = this._normalizePixelPosition(position);
    let pixel = this.bottomLayer.get(`${x}~${y}`);
    if (!pixel) return null;
    while (pixel && !pixel.isSplitable()) {
      pixel = pixel?.parent || undefined;
    }
    return pixel || null;
  }

  private _normalizePixelPosition(position: [number, number]): [number, number] {
    const [x, y] = position.map(Math.floor);
    return [x + (x % 2 === 0 ? 0 : 1), y + (y % 2 === 0 ? 0 : 1)];
  }

  private _findPixelAndSplit(startPoint: PixelCoords, endPoint: PixelCoords) {
    const breaks = this._breakInterval(startPoint, endPoint);
    for (let i = 0; i < breaks.length - 1; i++) {
      const end = breaks[i + 1];
      const pixel = this._splitablePixelAt(end as PixelCoords);
      if (pixel && pixel.isSplitable()) {
        if (!this.wasPuzzleInteracted) this.wasPuzzleInteracted = true;
        pixel.splitThisPixel();
      }
    }
  }

  private _getIntervalLength(startPoint: PixelCoords, endPoint: PixelCoords) {
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  private _breakInterval(startPoint: PixelCoords, endPoint: PixelCoords) {
    const maxLength = 4;
    const breaks = [];
    const length = this._getIntervalLength(startPoint, endPoint);
    const numSplits = Math.max(Math.ceil(length / maxLength), 1);
    const dx = (endPoint[0] - startPoint[0]) / numSplits;
    const dy = (endPoint[1] - startPoint[1]) / numSplits;
    const startX = startPoint[0];
    const startY = startPoint[1];

    for (let i = 0; i <= numSplits; i++) {
      breaks.push([startX + dx * i, startY + dy * i]);
    }
    return breaks;
  }

  private _setWrapperSVGElement() {
    if (!this.containerSelector) return;
    const wrapper = d3.select(this.containerSelector);
    if (!wrapper) return;
    const wrapperNode = wrapper.node() as HTMLElement | null;
    if (!wrapperNode) return;
    const isWrapperEmpty = wrapperNode.innerText === '';
    if (isWrapperEmpty) {
      //@ts-ignore
      this.wrapperSVGElement = wrapper
        .append('svg')
        .attr('width', this.maxSize)
        .attr('height', this.maxSize);
    } else {
      wrapper.selectAll('rect').remove();
    }
    if (wrapper.select('svg').empty()) {
      throw new Error('Failed to set SVG element');
    }
  }

  private _getAverageColor(...colorSchemes: number[][]) {
    return colorSchemes.reduce((avgColor, colorScheme) => [
      avgColor[0] + colorScheme[0],
      avgColor[1] + colorScheme[1],
      avgColor[2] + colorScheme[2]
    ], [0, 0, 0]).map((channelSum: number) => channelSum / colorSchemes.length);
  }
}
