import { PerspectiveCamera as BasePerspectiveCamera } from 'three';

import { roundDecimals } from '../utils';
import { BaseCameraMixin, Camera } from './Camera';

export interface PerspectiveCameraOptions {
  fov: number;
  near?: number;
  far?: number;
}

export class PerspectiveCamera extends BaseCameraMixin(BasePerspectiveCamera) implements Camera {
  constructor(options: PerspectiveCameraOptions) {
    super(options.fov, 1, options?.near ?? 0.1, options?.far ?? 1000);

    /**
     * Return a proxy object to the camera so we may enrich some of the three.js methods and accessors
     */
    return new Proxy(this, new PerspectiveCameraProxyHandler());
  }

  /**
   * Update camera aspect and projection matrix if needed
   */
  update(): void {
    if (this.dirty) {
      const { width, height } = this._viewport;
      this.aspect = roundDecimals(
        (this.renderer.canvasSizeX * width) / (this.renderer.canvasSizeY * height),
        2,
      );

      this.updateProjectionMatrix();
      this.dirty = false;
    }
  }
}

/**
 * List of camera properties that that require a camera update if changed
 */
const dirtyAttrs = ['fov', 'near', 'far', 'aspect', 'zoom'];
/**
 * Proxy handler for the camera
 */
class PerspectiveCameraProxyHandler implements ProxyHandler<PerspectiveCamera> {
  set(target: PerspectiveCamera, p: string | symbol, value: any, receiver: any): boolean {
    if (dirtyAttrs.includes(p as string)) {
      target.dirty = true;
    }

    return Reflect.set(target, p, value, receiver);
  }
}
