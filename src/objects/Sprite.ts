import { DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three';

import { ObservableVector2 } from '../math';
import { BaseTexture, GlobalTextureManager, Texture } from '../texture';

export class Sprite extends Group {
  protected _texture: Texture;

  protected _width: number;
  protected _height: number;

  protected _anchor: Vector2;

  protected _mesh: Mesh;
  protected readonly _meshGeometry: PlaneGeometry;
  protected readonly _meshMaterial: MeshBasicMaterial;

  autoUpdateAnchor = true;

  constructor(source: Texture | BaseTexture) {
    super();

    let texture: Texture = null;
    if (source instanceof Texture) {
      texture = source;
    } else {
      texture = new Texture(source);
    }

    this._meshGeometry = new PlaneGeometry(1, 1, 1, 1);
    this._meshMaterial = new MeshBasicMaterial({
      side: DoubleSide,
      transparent: true,
    });

    this._mesh = new Mesh(this._meshGeometry, this._meshMaterial);
    this.add(this._mesh);

    this._anchor = new ObservableVector2(texture.anchor.x, texture.anchor.y, this._update);

    this.texture = texture;
  }

  private _onTextureUpdate = (): void => {
    this._width = this._texture.trim ? this._texture.trim.width : this._texture.orig.width;
    this._height = this._texture.trim ? this._texture.trim.height : this._texture.orig.height;

    this._mesh.scale.set(this._texture.frame.width, -this._texture.frame.height, 1);
    this._mesh.rotation.z = this._texture.rotate;

    this._meshMaterial.map = this._texture;

    this._update();
  };

  private _update = (): void => {
    this._mesh.position.set(
      this._width / 2 - this._width * this._anchor.x,
      this._height / 2 - this._height * this._anchor.y,
      0,
    );
  };

  get width(): number {
    return this._width;
  }
  get height(): number {
    return this._height;
  }

  get anchor(): Vector2 {
    return this._anchor;
  }
  set anchor(value: Vector2) {
    this._anchor.copy(value);
  }

  get material() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this;

    return {
      get map(): Texture {
        return scope.texture;
      },
      set map(value: Texture | BaseTexture | string) {
        scope.texture = value;
      },
    };
  }

  get texture(): Texture {
    return this._texture;
  }
  set texture(value: Texture | BaseTexture | string) {
    if (typeof value === 'string') {
      value = GlobalTextureManager.get(value);
      if (!value) {
        throw new Error(`Sprite: Texture with key "${value}" not found.`);
      }
    }

    if (this._texture === value) {
      return;
    }

    let texture: Texture = null;
    if (value instanceof Texture) {
      texture = value;
    } else {
      texture = new Texture(value);
    }

    if (this._texture) {
      this._texture.removeEventListener('update', this._onTextureUpdate);
    }

    this._texture = texture;

    if (this.autoUpdateAnchor) {
      this._anchor.copy(this._texture.anchor);
    }

    this._texture.addEventListener('update', this._onTextureUpdate);

    this._onTextureUpdate();
  }

  dispose(): void {
    this._meshMaterial.dispose();
    this._meshGeometry.dispose();

    if (this._texture) {
      this._texture.removeEventListener('update', this._onTextureUpdate);
    }

    this._mesh = null;
  }
}
