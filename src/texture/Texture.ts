import { Vector2, Vector4 } from 'three';

import { ObservableVector4 } from '../math/ObservableVector';
import { BaseTexture } from './BaseTexture';

export class Texture extends BaseTexture {
  private _baseTexture: BaseTexture;

  private _frame: Vector4;

  private _rotate = 0;

  private _anchor: Vector2;

  private _orig: Vector4;

  private _trim?: Vector4;

  private _noFrame: boolean;

  constructor(
    source?: Texture | BaseTexture | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    frame?: Vector4,
    orig?: Vector4,
    trim?: Vector4,
    rotate?: number,
    anchor?: Vector2,
  ) {
    super();

    this._noFrame = false;
    if (!frame) {
      this._noFrame = true;
      frame = new ObservableVector4(0, 0, 1, 1, this._updateUVs);
    }

    if (!source) {
      source = new BaseTexture();
    }

    if (source instanceof Texture) {
      source = source.baseTexture;
    }

    if (source instanceof HTMLElement) {
      source = new BaseTexture(source);
    }

    this._baseTexture = source;

    this.copy(source);

    this._frame = ObservableVector4.copy(frame, this._updateUVs);

    this._orig = orig ? orig.clone() : this._frame;
    this._trim = trim?.clone();

    this._rotate = rotate || 0;

    this._anchor = anchor ? anchor.clone() : new Vector2(0, 0);

    this._baseTexture.addEventListener('update', this._onBaseTextureUpdated);

    this.onUpdate = this._updateUVs;

    this._onBaseTextureUpdated();
  }

  private _onBaseTextureUpdated = (): void => {
    if (!this._baseTexture.image) {
      return;
    }

    this.copy(this._baseTexture);

    if (this._noFrame) {
      this._frame.width = this._baseTexture.image.width;
      this._frame.height = this._baseTexture.image.height;
    } else {
      this._updateUVs();
    }
  };

  private _updateUVs = (): void => {
    if (!this._baseTexture.image) {
      return;
    }

    const repeatX = this._frame.width / this._baseTexture.image.width;
    const repeatY = this._frame.height / this._baseTexture.image.height;

    const offsetX = this._frame.x / this._baseTexture.image.width;
    const offsetY =
      1 -
      this._frame.height / this._baseTexture.image.height -
      this._frame.y / this._baseTexture.image.height;

    this.offset.set(offsetX, offsetY);
    this.repeat.set(repeatX, repeatY);
  };

  get frame(): Vector4 {
    return this._frame;
  }
  set frame(value: Vector4) {
    this._frame.copy(value);
  }

  get rotate(): number {
    return this._rotate;
  }
  set rotate(value: number) {
    this._rotate = value;
  }

  get anchor(): Vector2 {
    return this._anchor;
  }
  set anchor(value: Vector2) {
    this._anchor.copy(value);
  }

  get orig(): Vector4 {
    return this._orig.clone();
  }
  get trim(): Vector4 {
    return this._trim?.clone();
  }

  get baseTexture(): BaseTexture {
    return this._baseTexture;
  }

  dispose(): void {
    this._baseTexture.removeEventListener('update', this._onBaseTextureUpdated);
    super.dispose();
  }
}
