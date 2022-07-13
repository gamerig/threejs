import { Color, Object3D, Vector2, Vector4 } from 'three';

import { Camera } from '../cameras';
import { Center, ScaleMode } from './types';

export interface Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly canvasSize: Vector4;

  size: Vector2;
  pixelDensity: number;

  minResolution: Vector2;
  maxResolution: Vector2;

  readonly resolution: Vector2;

  scaleResolution: boolean;
  scaleMode: ScaleMode;
  autoCenter: Center;

  autoClear: boolean;
  clearColor: string | number | Color;
  clearAlpha: number;

  readonly viewport: Vector4;
  readonly viewportSize: Vector4;

  render(object: Object3D, camera?: Camera): void;
}
