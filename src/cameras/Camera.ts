import { Camera as BaseCamera, Color, Vector4 } from 'three';

import { ObservableVector4 } from '../math';
import { ClearFlag, Renderer } from '../renderer';

export interface Camera extends BaseCamera {
  needsUpdate: boolean;
  autoUpdate: boolean;
  clearFlag: ClearFlag;
  clearColor: string | number | Color;
  clearAlpha: number;
  order: number;
  enabled: boolean;
  viewport: Vector4;

  update?(renderer: Renderer): void;
}

type CameraConstructor = new (...args: any[]) => BaseCamera;

export const CameraMixin = <T extends CameraConstructor>(base: T) => {
  return class extends base {
    needsUpdate = true;
    autoUpdate = true;

    clearFlag = ClearFlag.Color;
    clearColor = 0xffffff;
    clearAlpha = 1;

    order = 0;
    enabled = true;

    viewport = new ObservableVector4(0, 0, 1, 1, () => {
      this.needsUpdate = true;
    });
  };
};
