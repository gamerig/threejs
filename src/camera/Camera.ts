import { Camera as BaseCamera, Color, Vector4 } from 'three';

import { Renderer } from '../renderer/Renderer';
import { View } from '../scene/View';
import { ClearFlag } from '../types';

/**
 * All cameras should extends this interface which subsequently extends the three.js base camera
 * While three.js default camera types can be used inside a scene(because after all a camera is an Object3D)
 * we recommend to use gamerig's defined cameras for better integration and additional helpful features
 */
export interface Camera extends BaseCamera {
  type: string;

  /**
   * Internal flag to mark the camera as modified in such a way that it requires
   * an update of the projection matrix
   */
  dirty: boolean;

  /**
   * The clear flags control how the camera viewport is cleared before rendering again
   */
  clearFlag: ClearFlag;
  clearColor: string | number | Color;
  clearAlpha: number;

  /**
   * Rendering order of the camera inside the view
   */
  order: number;

  /**
   * Toggles the camera rendering
   */
  enabled: boolean;

  /**
   * Rendering instance
   */
  renderer: Renderer;

  /**
   * List of scene/View that this camera is added to
   */
  views: View[];

  /**
   * Store currently set viewport
   */
  readonly viewport: Vector4;

  updateProjectionMatrix(): void;

  setViewport(viewport: Vector4): void;
  setViewport(x: number, y: number, width: number, height: number): void;
  resetViewport(): void;

  update(): void;
}

type CameraConstructor = new (...args: any[]) => BaseCamera & {
  updateProjectionMatrix: () => void;
};

/**
 * Camera mixin/trait for general camera features applicable to all camera types
 *
 * @param superclass
 * @returns
 */
export const BaseCameraMixin = <T extends CameraConstructor>(superclass: T) => {
  return class BaseCamera extends superclass {
    userData = {
      isGamerigCamera: true,
    };

    dirty = true;
    enabled = true;

    clearFlag = ClearFlag.Color;
    clearColor = 0xffffff;
    clearAlpha = 1;

    views: View[] = [];

    renderer!: Renderer;

    _order = 0;
    get order(): number {
      return this._order;
    }
    set order(order: number) {
      this._order = order;
      // we need to tell the views where this camera is added that they need to sort the cameras
      // more so if they have multiple cameras in the same view
      this.views.forEach((view) => (view.sortCameras = true));
    }

    readonly _viewport = new Vector4(0, 0, 1, 1);

    get viewport(): Vector4 {
      return this._viewport.clone();
    }

    setViewport(viewport: Vector4): void;
    setViewport(x: number, y: number, width: number, height: number): void;
    setViewport(x: number | Vector4, y?: number, width?: number, height?: number): void {
      if (typeof x === 'number') {
        this._viewport.set(x, y, width, height);
      } else {
        this._viewport.copy(x);
      }

      this.dirty = true;
    }

    resetViewport(): void {
      this.setViewport(0, 0, 1, 1);
    }
  };
};
