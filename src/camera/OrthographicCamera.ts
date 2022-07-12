import { OrthographicCamera as BaseOrthographicCamera, Vector4 } from 'three';

import { roundDecimals } from '../utils';
import { BaseCameraMixin, Camera } from './Camera';

/**
 * An orthographic camera is defined by either manually specifing the rectangle size
 * or the size in units of the viewport relative to the center of the camera.
 * size option is taking precendence
 */
export interface OrthographicCameraOptions {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  size?: number;
  near?: number;
  far?: number;
}

export class OrthographicCamera extends BaseCameraMixin(BaseOrthographicCamera) implements Camera {
  /**
   * This size vector stores the initial desires camera rectangle
   * unaffected by the set viewport and renderer aspect ratio
   */
  readonly size: Vector4 = new Vector4();

  constructor(options: OrthographicCameraOptions) {
    if (!options.size && (!options.left || !options.right || !options.top || !options.bottom)) {
      throw new Error('Either size or left, right, top, bottom must be specified');
    }

    if (options.size) {
      options.left = options.size / -2;
      options.right = options.size / 2;
      options.top = options.size / 2;
      options.bottom = options.size / -2;
    }

    const { left, right, top, bottom } = options;

    super(left, right, top, bottom, options?.near ?? 0.1, options?.far ?? 1000);

    this.size.set(left, right, top, bottom);

    /**
     * Return a proxy object to the camera so we may enrich some of the three.js methods and accessors
     */
    return new Proxy(this, new OrthographicCameraProxyHandler());
  }

  /**
   * If it's the case, update camera parameters according to the viewport
   * and current renderer aspect ratio and update projection matrix
   */
  update(): void {
    if (this.dirty) {
      const { width, height } = this._viewport;

      //the original aspect of the camera size
      const sizeAspect = Math.abs((this.size.y - this.size.x) / (this.size.w - this.size.z));

      // viewport aspect is calculated by scaling the rendered size by the viewport dimensions
      // which is a normalized vector with values between 0 and 1
      const viewportAspect =
        (this.renderer.canvasSizeX * width) / (this.renderer.canvasSizeY * height);

      // calculate the ration between the viewport and size aspect
      const aspect = roundDecimals(viewportAspect / sizeAspect, 2);

      // scale the original size with the found aspect in order to get a responsive camera
      // and avoid streching of textures
      this.left = this.size.x * aspect;
      this.right = this.size.y * aspect;

      this.updateProjectionMatrix();
      this.dirty = false;
    }
  }
}

/**
 * List of camera properties that should mark camera as dirty when changed
 */
const dirtyAttrs = ['left', 'right', 'top', 'bottom', 'zoom', 'near', 'far'];
/**
 * Wrap original camera accessors to enrich functionality via the created proxy object
 */
class OrthographicCameraProxyHandler implements ProxyHandler<OrthographicCamera> {
  set(target: OrthographicCamera, p: string | symbol, value: any, receiver: any): boolean {
    if (dirtyAttrs.includes(p as string)) {
      target.dirty = true;
    }

    if (p === 'left') {
      target.size.x = value;
    }
    if (p === 'right') {
      target.size.y = value;
    }
    if (p === 'top') {
      target.size.z = value;
    }
    if (p === 'bottom') {
      target.size.w = value;
    }

    return Reflect.set(target, p, value, receiver);
  }
}
