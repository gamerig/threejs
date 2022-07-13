import { OrthographicCamera as BaseOrthographicCamera, Vector2 } from 'three';

import { Renderer } from '../renderer';
import { Camera, CameraMixin } from './Camera';

/**
 * Specialized ortographic camera for 2D game development
 * The size is matching pixels of the canvas(1 unit = 1 pixel)
 */
export class Camera2D extends CameraMixin(BaseOrthographicCamera) implements Camera {
  readonly size: Vector2;

  constructor() {
    // set default size as canvas default
    // but this won't matter, as it will be updated on the first camera update call
    super(0, 300, 0, 150);

    this.size = new Vector2(300, 150);
    this.position.set(0, 0, 5);
    this.lookAt(0, 0, 0);
  }

  update(renderer: Renderer): void {
    const gameWidth = renderer.size.width;
    const gameHeight = renderer.size.height;

    const sizeChanged = this.size.x !== gameWidth || this.size.y !== gameHeight;

    if (this.needsUpdate || sizeChanged) {
      this.size.set(gameWidth, gameHeight);

      // scale the final camera size according to the viewport
      this.left = 0;
      this.top = 0;
      this.right = gameWidth;
      this.bottom = gameHeight;

      this.updateProjectionMatrix();
      this.needsUpdate = false;
    }
  }
}
