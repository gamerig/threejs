import { IEngine, System } from '@gamerig/core';

import { Renderer } from './Renderer';
import { WebGLRenderer } from './WebGLRenderer';

/**
 * Rendering system class to hook library into the engine's core
 * Very thin layer over the renderer to receive clock ticks and render the scene
 */
export class RenderingSystem extends System {
  constructor(private readonly _renderer: WebGLRenderer) {
    super();

    this._renderer.webgl.autoClear = false;
    this._renderer.webgl.info.autoReset = false;
    this._renderer.webgl.setScissorTest(true);
  }

  init(engine: IEngine) {
    engine.addProvider({ key: Renderer.KEY, useValue: this._renderer });
  }

  update(): void {
    if (this._renderer.needsUpdate) {
      this._renderer.update();
      this._renderer.needsUpdate = false;
    }
  }

  render() {
    this._renderer.webgl.info.reset();

    if (this._renderer.autoClear) {
      this._renderer.clear();
    }
  }

  get renderer(): Renderer {
    return this._renderer;
  }

  destroy(): void {
    this._renderer.clear();
    this._renderer.dispose();
  }
}
