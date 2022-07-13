import { PerspectiveCamera as BasePerspectiveCamera } from 'three';

import { roundDecimals } from '../math';
import { Renderer } from '../renderer';
import { Camera, CameraMixin } from './Camera';

export class PerspectiveCamera extends CameraMixin(BasePerspectiveCamera) implements Camera {
  constructor(fov?: number, aspect?: number, near?: number, far?: number) {
    super(fov, aspect, near, far);

    return new Proxy(this, new PerspectiveCameraProxyHandler());
  }

  update(renderer: Renderer): void {
    if (this.needsUpdate && this.autoUpdate) {
      const { width, height } = this.viewport;
      this.aspect = roundDecimals(
        (renderer.canvasSize.width * width) / (renderer.canvasSize.height * height),
        2,
      );

      this.updateProjectionMatrix();
      this.needsUpdate = false;
    }
  }
}

const props = ['fov', 'near', 'far', 'aspect', 'zoom'];
class PerspectiveCameraProxyHandler implements ProxyHandler<PerspectiveCamera> {
  set(target: PerspectiveCamera, p: string | symbol, value: any, receiver: any): boolean {
    if (props.includes(p as string)) {
      target.needsUpdate = true;
    }

    return Reflect.set(target, p, value, receiver);
  }
}
