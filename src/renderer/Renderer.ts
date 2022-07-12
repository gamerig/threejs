import { Color, Object3D, Vector4 } from 'three';

import { Camera } from '../camera/Camera';
import { Center, ScaleMode } from '../types';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Renderer {
  export const KEY = Symbol('Renderer');
}

export interface Renderer {
  readonly canvas: HTMLCanvasElement;

  // original set size(game size)
  sizeX: number;
  sizeY: number;

  // canvas size in pixels
  readonly canvasSizeX: number;
  readonly canvasSizeY: number;

  // determine final resolution by scaling the canvas size with this
  pixelDensity: number;

  // min cap resolution
  minResolutionX: number;
  minResolutionY: number;

  // max cap resolution
  maxResolutionX: number;
  maxResolutionY: number;

  // current resolution
  readonly resolutionX: number;
  readonly resolutionY: number;

  scaleResolution: boolean;
  scaleMode: ScaleMode;
  autoCenter: Center;

  autoClear: boolean;
  clearColor: string | number | Color;
  clearAlpha: number;

  readonly viewport: Vector4;
  readonly viewportSize: Vector4;

  setViewport(v: Vector4): void;
  setViewport(x: number, y: number, width: number, height: number): void;
  resetViewport(): void;

  render(object: Object3D, camera: Camera): void;
}
