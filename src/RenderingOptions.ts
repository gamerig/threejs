import { RendererOptions } from './renderer/RendererOptions';

export interface RenderingOptions {
  renderer: RendererOptions;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RenderingOptions {
  export const KEY = Symbol('RenderingOptions');
}
