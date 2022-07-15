import {
  Color,
  EventDispatcher,
  Object3D,
  Vector2,
  Vector4,
  WebGLRenderer as ThreeRenderer,
} from 'three';

import { Camera } from '../cameras';
import { ObservableVector2, ObservableVector4, roundDecimals } from '../math';
import { Scene } from '../scenes';
import { Renderer } from './Renderer';
import { RendererOptions } from './RendererOptions';
import { Center, ClearFlag, RendererEvent, ScaleMode } from './types';

export class WebGLRenderer extends EventDispatcher implements Renderer {
  needsUpdate = true;

  minResolution: Vector2;
  maxResolution: Vector2;

  size: Vector2;

  autoClear = true;
  clearColor: string | number | Color = 0xffffff;
  clearAlpha = 1;

  private _webgl: ThreeRenderer;

  private _scaleMode: ScaleMode = ScaleMode.None;
  private _autoCenter: Center = Center.None;

  private _resolution: Vector2;
  private _scaleResolution = false;
  private _pixelDensity = 1;
  private _canvasSize: Vector4;

  private _viewport: Vector4;
  private _viewportSize: Vector4;

  constructor(private readonly _options: RendererOptions) {
    super();

    this._webgl = new ThreeRenderer(_options);
    this._webgl.autoClear = false;
    this._webgl.info.autoReset = false;
    this._webgl.setScissorTest(true);

    this._scaleMode = this._options.size?.scaleMode ?? ScaleMode.None;
    this._autoCenter = this._options.size?.autoCenter ?? Center.None;

    this.size = new ObservableVector2(
      this._options.size?.width ?? window.innerWidth,
      this._options.size?.height ?? window.innerHeight,
      () => {
        this.needsUpdate = true;
      },
    );

    this.pixelDensity = this._options.resolution?.pixelDensity ?? 1;
    this.scaleResolution = this._options.resolution?.autoScale ?? false;

    this.minResolution = new ObservableVector2(
      this._options.resolution?.min?.width ?? 1,
      this._options.resolution?.min?.height ?? 1,
      () => {
        this.needsUpdate = true;
      },
    );

    this.maxResolution = new ObservableVector2(
      this._options.resolution?.max?.width ?? Number.MAX_SAFE_INTEGER,
      this._options.resolution?.max?.height ?? Number.MAX_SAFE_INTEGER,
      () => {
        this.needsUpdate = true;
      },
    );

    this._resolution = new Vector2();
    this._canvasSize = new Vector4();

    this._viewport = new ObservableVector4(0, 0, 1, 1, () => {
      this._viewportSize
        .set(
          this.resolution.x * this._viewport.x,
          this.resolution.y * this._viewport.y,
          this.resolution.x * this._viewport.width,
          this.resolution.y * this._viewport.height,
        )
        .round();

      this._webgl.setScissor(this._viewportSize);
      this._webgl.setViewport(this._viewportSize);
    });

    this._viewportSize = new Vector4();

    const canvas = this._webgl.domElement;
    canvas.style.display = 'block';

    this.clearColor = this._options.background?.color ?? 0xffffff;
    this.clearAlpha = this._options.background?.alpha ?? 1;

    this.autoClear = this._options.autoClear ?? true;

    window.addEventListener('resize', () => (this.needsUpdate = true));
  }

  update(): void {
    if (this.needsUpdate) {
      this._scaleCanvas();
      this._centerCanvas();
      this._updateBounds();
      this._updateResolution();

      this.needsUpdate = false;
    }
  }

  setSize(width: number, height: number): void {
    this.size.set(width, height);
  }

  get canvas(): HTMLCanvasElement {
    return this._webgl.domElement;
  }
  get domElement(): HTMLCanvasElement {
    return this._webgl.domElement;
  }
  get canvasSize(): Vector4 {
    return this._canvasSize.clone();
  }
  get resolution(): Vector2 {
    return this._resolution.clone();
  }

  get scaleResolution(): boolean {
    return this._scaleResolution;
  }
  set scaleResolution(scale: boolean) {
    this._scaleResolution = scale;
    this.needsUpdate = true;
  }

  get scaleMode(): ScaleMode {
    return this._scaleMode;
  }
  set scaleMode(scaleMode: ScaleMode) {
    this._scaleMode = scaleMode;
    this.needsUpdate = true;
  }

  get autoCenter(): Center {
    return this._autoCenter;
  }
  set autoCenter(autoCenter: Center) {
    this._autoCenter = autoCenter;
    this.needsUpdate = true;
  }

  get pixelDensity(): number {
    return this._pixelDensity;
  }
  set pixelDensity(pixelDensity: number) {
    this._pixelDensity = pixelDensity;
    this.needsUpdate = true;
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

  /**
   * Main method of the renderer
   * It takes a generic 3d object and a camera and renders it to the screen
   * It takes configured options and camera options into account
   *
   * @param renderable
   * @param camera
   */
  render(renderable: Object3D, camera?: Camera): void {
    const clearRenderer = (camera: Camera): void => {
      this.viewport.copy(camera.viewport);

      const clearColor = camera.clearFlag === ClearFlag.Color;
      const clearDepth = clearColor || camera.clearFlag === ClearFlag.Depth;

      this._webgl.setClearColor(camera.clearColor, camera.clearAlpha);
      this._webgl.clear(clearColor, clearDepth, true);
    };

    if (camera || !(renderable instanceof Scene)) {
      clearRenderer(camera);
      this._webgl.render(renderable, camera);
    } else if (renderable instanceof Scene) {
      if (renderable.cameras.length === 0) {
        return;
      }

      if (renderable.sortCameras) {
        renderable.cameras.sort((a, b) => a.order - b.order);
      }

      renderable.cameras.forEach((cam) => {
        clearRenderer(cam);
        cam.enabled && cam.update(this);
        cam.enabled && this._webgl.render(renderable, cam);
      });
    }
  }

  clear(): void {
    this._webgl.info.reset();

    this.viewport.set(0, 0, 1, 1);

    this._webgl.setClearColor(this.clearColor, this.clearAlpha);
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
    const targetWidth = this.size.width;
    const targetHeight = this.size.height;

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
      this.dispatchEvent({
        type: RendererEvent.CanvasResized,
        target: this,
        data: { width: newWidth, height: newHeight },
      });
    }

    if (oldAspect !== newAspect) {
      this.dispatchEvent({
        type: RendererEvent.AspectChanged,
        target: this,
        data: { aspect: newAspect },
      });
    }
  }

  /**
   * Internal game resolution can change automatically for specific configuration
   */
  private _updateResolution(): void {
    const canvas = this._webgl.domElement;
    const canvasRect = canvas.getBoundingClientRect();

    let resX = Math.round(this.size.width * this._pixelDensity);
    let resY = Math.round(this.size.height * this._pixelDensity);

    if (this._scaleResolution) {
      resX = Math.round(canvasRect.width * this._pixelDensity);
      resY = Math.round(canvasRect.height * this._pixelDensity);
    }

    resX = Math.max(Math.min(resX, this.maxResolution.width), this.minResolution.width);
    resY = Math.max(Math.min(resY, this.maxResolution.height), this.minResolution.height);

    if (resX !== this._resolution.width || resY !== this._resolution.height) {
      this._resolution.set(resX, resY);
      this._webgl.setSize(resX, resY, false);

      this.dispatchEvent({
        type: RendererEvent.ResolutionChanged,
        target: this,
        data: { width: resX, height: resY },
      });
    }
  }
}
