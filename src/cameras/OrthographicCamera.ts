import { OrthographicCamera as BaseOrtographicCamera, Vector4 } from 'three';

import { ObservableVector4, roundDecimals } from '../math';
import { Renderer } from '../renderer';
import { Camera, CameraMixin } from './Camera';

export class OrthographicCamera extends CameraMixin(BaseOrtographicCamera) implements Camera {
  readonly size: Vector4;

  constructor(
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
    near?: number,
    far?: number,
  ) {
    super(left, right, top, bottom, near, far);

    this.size = new ObservableVector4(this.left, this.right, this.top, this.bottom, (v) => {
      this.left = v.x;
      this.right = v.y;
      this.top = v.z;
      this.bottom = v.w;

      this.needsUpdate = true;
    });

    return new Proxy(this, new OrthographicCameraProxyHandler());
  }

  setSize(size: number): void {
    this.size.set(-size / 2, size / 2, size / 2, -size / 2);
  }

  update(renderer: Renderer): void {
    if (this.needsUpdate && this.autoUpdate) {
      const { width, height } = this.viewport;

      //the original aspect of the camera size
      const sizeAspect = Math.abs((this.size.y - this.size.x) / (this.size.w - this.size.z));

      // viewport aspect is calculated by scaling the rendered size by the viewport dimensions
      // which is a normalized vector with values between 0 and 1
      const viewportAspect =
        (renderer.canvasSize.width * width) / (renderer.canvasSize.height * height);

      // calculate the ration between the viewport and size aspect
      const aspect = roundDecimals(viewportAspect / sizeAspect, 2);

      // scale the original size with the found aspect in order to get a responsive camera
      // and avoid streching of textures
      this.left = this.size.x * aspect;
      this.right = this.size.y * aspect;

      this.updateProjectionMatrix();
      this.needsUpdate = false;
    }
  }
}

const props = ['left', 'right', 'top', 'bottom', 'zoom', 'near', 'far'];
class OrthographicCameraProxyHandler implements ProxyHandler<OrthographicCamera> {
  set(target: OrthographicCamera, p: string | symbol, value: any, receiver: any): boolean {
    if (props.includes(p as string)) {
      target.needsUpdate = true;
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
