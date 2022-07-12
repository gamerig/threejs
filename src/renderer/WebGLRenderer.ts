import { IEngine } from '@gamerig/core';
import { Color, Object3D, Vector2, Vector4, WebGLRenderer as ThreeRenderer } from 'three';

import { Camera } from '../camera/Camera';
import { Center, ClearFlag, ScaleMode } from '../types';
import { roundDecimals } from '../utils';
import { Renderer } from './Renderer';
import { RendererEvent } from './RendererEvent';
import { RendererOptions } from './RendererOptions';

export class WebGLRenderer implements Renderer {
  /**
   * internal three.js reference to the webgl renderer
   */
  private _webgl: ThreeRenderer;

  /**
   * Internal flag to mark the renderer as eligible for an update.
   */
  private _needsUpdate = true;

  /**
   * Controls how the canvas will fit the screen
   */
  private _scaleMode: ScaleMode = ScaleMode.None;
  private _autoCenter: Center = Center.None;

  /**
   * Stores current renderer resolution. Based on pixel density and other configuration options
   * this value can be different from the canvas size.
   */
  private _resolution: Vector2 = new Vector2();
  /**
   * Configuration options to store resolution bounds. Particulary useful for
   * limiting the resolution when scale resolution is enabled especially on high DPI devices
   */
  private _minResolution: Vector2 = new Vector2();
  private _maxResolution: Vector2 = new Vector2();

  /**
   * Stores initial game size set at initialization
   */
  private _size: Vector2 = new Vector2();

  /**
   * Stores the actual canvas size, it's updated when window is resized
   */
  private _canvasSize: Vector4 = new Vector4();

  /**
   * Flag enabling automatical resolution changes to match the canvas size
   */
  private _scaleResolution = false;

  /**
   * Pixel density of the screen
   */
  private _pixelDensity = 1;

  /**
   * Renderer viewport can be set to render only on part of the canvas
   * It is a clamped vector with values between  0 and 1
   */
  private _viewport: Vector4 = new Vector4(0, 0, 1, 1);
  /**
   * Viewport actual size in pixels, taking resolution into account
   */
  private _viewportSize: Vector4 = new Vector4();

  /**
   * Properties to control how the renderer should clear the screen on each frame update
   */
  private _autoClear = true;
  private _clearColor: string | number | Color = 0xffffff;
  private _clearAlpha = 1;

  constructor(private readonly _engine: IEngine, private readonly _options: RendererOptions) {
    this._webgl = new ThreeRenderer(_options);

    this._scaleMode = this._options.size?.scaleMode ?? ScaleMode.None;
    this._autoCenter = this._options.size?.autoCenter ?? Center.None;

    this._size = new Vector2(
      this._options.size?.width ?? window.innerWidth,
      this._options.size?.height ?? window.innerHeight,
    );

    this._pixelDensity = this._options.resolution?.pixelDensity ?? 1;

    this._scaleResolution = this._options.resolution?.autoScale ?? false;

    this._minResolution = new Vector2(
      this._options.resolution?.min?.width ?? 1,
      this._options.resolution?.min?.height ?? 1,
    );

    this._maxResolution = new Vector2(
      this._options.resolution?.max?.width ?? Number.MAX_SAFE_INTEGER,
      this._options.resolution?.max?.height ?? Number.MAX_SAFE_INTEGER,
    );

    const canvas = this._webgl.domElement;
    canvas.style.display = 'block';

    this._clearColor = this._options.background?.color ?? 0xffffff;
    this._clearAlpha = this._options.background?.alpha ?? 1;

    this._autoClear = this._options.autoClear ?? true;

    window.addEventListener('resize', () => (this._needsUpdate = true));
  }

  update(): void {
    this._scaleCanvas();
    this._centerCanvas();
    this._updateBounds();
    this._updateResolution();
  }

  get canvas(): HTMLCanvasElement {
    return this._webgl.domElement;
  }

  get needsUpdate(): boolean {
    return this._needsUpdate;
  }
  set needsUpdate(update: boolean) {
    this._needsUpdate = update;
  }

  get autoClear(): boolean {
    return this._autoClear;
  }
  set autoClear(clear: boolean) {
    this._autoClear = clear;
  }

  get clearColor(): string | number | Color {
    return this._clearColor;
  }
  set clearColor(color: string | number | Color) {
    this._clearColor = color;
  }

  get clearAlpha(): number {
    return this._clearAlpha;
  }
  set clearAlpha(alpha: number) {
    this._clearAlpha = alpha;
  }

  get sizeX(): number {
    return this._size.width;
  }
  set sizeX(sizeX: number) {
    this._size.x = sizeX;
    this._needsUpdate = true;
  }
  get sizeY(): number {
    return this._size.height;
  }
  set sizeY(sizeY: number) {
    this._size.y = sizeY;
    this._needsUpdate = true;
  }

  get canvasSizeX(): number {
    return this._canvasSize.width;
  }
  get canvasSizeY(): number {
    return this._canvasSize.height;
  }

  get resolutionX(): number {
    return this._resolution.x;
  }
  get resolutionY(): number {
    return this._resolution.y;
  }

  get minResolutionX(): number {
    return this._minResolution.x;
  }
  set minResolutionX(x: number) {
    this._minResolution.x = x;
    this._needsUpdate = true;
  }
  get minResolutionY(): number {
    return this._minResolution.y;
  }
  set minResolutionY(y: number) {
    this._minResolution.y = y;
    this._needsUpdate = true;
  }

  get maxResolutionX(): number {
    return this._maxResolution.x;
  }
  set maxResolutionX(x: number) {
    this._maxResolution.x = x;
    this._needsUpdate = true;
  }
  get maxResolutionY(): number {
    return this._maxResolution.y;
  }
  set maxResolutionY(y: number) {
    this._maxResolution.y = y;
    this._needsUpdate = true;
  }

  get scaleResolution(): boolean {
    return this._scaleResolution;
  }
  set scaleResolution(scale: boolean) {
    this._scaleResolution = scale;
    this._needsUpdate = true;
  }

  get scaleMode(): ScaleMode {
    return this._scaleMode;
  }
  set scaleMode(scaleMode: ScaleMode) {
    this._scaleMode = scaleMode;
    this._needsUpdate = true;
  }

  get autoCenter(): Center {
    return this._autoCenter;
  }
  set autoCenter(autoCenter: Center) {
    this._autoCenter = autoCenter;
    this._needsUpdate = true;
  }

  get pixelDensity(): number {
    return this._pixelDensity;
  }
  set pixelDensity(pixelDensity: number) {
    this._pixelDensity = pixelDensity;
    this._needsUpdate = true;
  }

  get viewport(): Vector4 {
    return this._viewport.clone();
  }
  get viewportSize(): Vector4 {
    return this._viewportSize.clone();
  }

  get webgl(): ThreeRenderer {
    return this._webgl;
  }

  setViewport(x: Vector4): void;
  setViewport(x: number, y: number, width: number, height: number): void;
  setViewport(x: number | Vector4, y?: number, width?: number, height?: number): void {
    if (x instanceof Vector4) {
      this._viewport.copy(x).clampScalar(0, 1);
    } else {
      this._viewport.set(x, y, width, height).clampScalar(0, 1);
    }

    this._viewportSize
      .set(
        this.resolutionX * this._viewport.x,
        this.resolutionY * this._viewport.y,
        this.resolutionX * this._viewport.width,
        this.resolutionY * this._viewport.height,
      )
      .round();

    this._webgl.setScissor(this._viewportSize);
    this._webgl.setViewport(this._viewportSize);
  }

  resetViewport(): void {
    this.setViewport(0, 0, 1, 1);
  }

  /**
   * Main method of the renderer
   * It takes a generic 3d object and a camera and renders it to the screen
   * It takes configured options and camera options into account
   *
   * @param renderable
   * @param camera
   */
  render(renderable: Object3D, camera: Camera): void {
    this.setViewport(camera.viewport);

    const clearColor = camera.clearFlag === ClearFlag.Color;
    const clearDepth = clearColor || camera.clearFlag === ClearFlag.Depth;

    this._webgl.setClearColor(camera.clearColor, camera.clearAlpha);
    this._webgl.clear(clearColor, clearDepth, true);
    this._webgl.render(renderable, camera);
  }

  clear(): void {
    this.resetViewport();

    this._webgl.setClearColor(this._clearColor, this._clearAlpha);
    this._webgl.clear();
  }

  dispose(): void {
    this._webgl.dispose();
  }

  /**
   * Change canvas CSS dimensions according to parent dimensions and scale mode
   */
  private _scaleCanvas(): void {
    const canvas = this._webgl.domElement;
    const parent = canvas.parentElement ?? document.body;

    const parentRect = parent.getBoundingClientRect();
    const targetWidth = this._size.width;
    const targetHeight = this._size.height;

    const aspectWith = parentRect.width / targetWidth;
    const aspectHeight = parentRect.height / targetHeight;

    let width = targetWidth;
    let height = targetHeight;

    switch (this._scaleMode) {
      case ScaleMode.Fit:
      case ScaleMode.Fill:
        const aspect =
          this._scaleMode === ScaleMode.Fit
            ? Math.min(aspectWith, aspectHeight)
            : Math.max(aspectWith, aspectHeight);

        width = targetWidth * aspect;
        height = targetHeight * aspect;
        break;

      case ScaleMode.FitHeight:
        width = parentRect.width;
        height = (targetHeight * width) / targetHeight;
        break;

      case ScaleMode.FitWidth:
        height = parentRect.height;
        width = (targetWidth * height) / targetHeight;
        break;

      case ScaleMode.Stretch:
        width = parentRect.width;
        height = parentRect.height;
    }

    width = Math.round(width);
    height = Math.round(height);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  /**
   * Automatically center canvas within the parent based on config
   */
  private _centerCanvas(): void {
    if (this._autoCenter === Center.None) {
      return;
    }

    const canvas = this._webgl.domElement;
    const parent = canvas.parentElement ?? document.body;

    const parentRect = parent.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    let offsetX = (parentRect.width - canvasRect.width) / 2;
    let offsetY = (parentRect.height - canvasRect.height) / 2;

    if (this._autoCenter === Center.Horizontal) {
      offsetY = 0;
    }

    if (this._autoCenter === Center.Vertical) {
      offsetX = 0;
    }

    offsetX = Math.round(offsetX);
    offsetY = Math.round(offsetY);

    canvas.style.marginLeft = `${offsetX}px`;
    canvas.style.marginTop = `${offsetY}px`;

    this._canvasSize.x = offsetX;
    this._canvasSize.y = offsetY;
  }

  /**
   * Update internal canvas size tracker and trigger related events
   */
  private _updateBounds(): void {
    const canvas = this._webgl.domElement;
    const canvasRect = canvas.getBoundingClientRect();

    const newWidth = Math.round(canvasRect.width);
    const newHeight = Math.round(canvasRect.height);

    const oldAspect = roundDecimals(this._canvasSize.width / this._canvasSize.height, 2);
    const newAspect = roundDecimals(newWidth / newHeight, 2);
    const resized = this._canvasSize.width !== newWidth || this._canvasSize.height !== newHeight;

    // update internal tracked size before triggering events
    this._canvasSize.width = newWidth;
    this._canvasSize.height = newHeight;

    if (resized) {
      this._engine.messaging.publish(
        RendererEvent.SizeChanged,
        this,
        this._canvasSize.x,
        this._canvasSize.y,
        this._canvasSize.width,
        this._canvasSize.height,
      );
    }

    if (oldAspect !== newAspect) {
      this._engine.messaging.publish(RendererEvent.AspectChanged, this, newAspect);
    }
  }

  /**
   * Internal game resolution can change automatically for specific configuration
   */
  private _updateResolution(): void {
    const canvas = this._webgl.domElement;
    const canvasRect = canvas.getBoundingClientRect();

    let resX = Math.round(this._size.width * this._pixelDensity);
    let resY = Math.round(this._size.height * this._pixelDensity);

    if (this._scaleResolution) {
      resX = Math.round(canvasRect.width * this._pixelDensity);
      resY = Math.round(canvasRect.height * this._pixelDensity);
    }

    resX = Math.max(Math.min(resX, this._maxResolution.width), this._minResolution.width);
    resY = Math.max(Math.min(resY, this._maxResolution.height), this._minResolution.height);

    if (resX !== this._resolution.width || resY !== this._resolution.height) {
      this._resolution.set(resX, resY);
      this._webgl.setSize(resX, resY, false);

      this._engine.messaging.publish(RendererEvent.ResolutionChanged, this, resX, resY);
    }
  }
}
