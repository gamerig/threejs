import { WebGLRendererParameters } from 'three';

import { Center, ScaleMode } from '../types';

type WebGLRendererOptions = Omit<
  WebGLRendererParameters,
  'canvas' | 'alpha' | 'antialias' | 'premultipliedAlpha'
>;

export type RendererOptions = WebGLRendererOptions & {
  canvas: HTMLCanvasElement;
  autoClear?: boolean;
  alpha?: boolean;
  premultipliedAlpha?: boolean;
  antialias?: boolean;
  background?: {
    color?: number | string;
    alpha?: number;
  };
  size?: {
    width?: number;
    height?: number;
    scaleMode?: ScaleMode;
    autoCenter?: Center;
  };
  resolution?: {
    pixelDensity?: number;
    autoScale?: boolean;
    min?: {
      width: number;
      height: number;
    };
    max?: {
      width: number;
      height: number;
    };
  };
};
