import { AnimationClip, RepeatWrapping, Vector2, Vector4 } from 'three';

import { BaseTexture, Texture, TextureCache } from '../texture';

export class Spritesheet {
  public textures: { [name: string]: Texture } = {};

  public animations: { [name: string]: AnimationClip } = {};

  private _baseTexture: BaseTexture;
  private _disposeBase = false;

  constructor(
    source: Texture | BaseTexture | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  ) {
    if (source instanceof Texture) {
      source = source.baseTexture;
    }

    if (source instanceof HTMLElement) {
      source = new BaseTexture(source);
      this._disposeBase = true;
    }

    this._baseTexture = source;
    this._baseTexture.wrapS = this._baseTexture.wrapT = RepeatWrapping;
  }

  addFrame(data: {
    name: string;
    frame: Vector4;
    orig?: Vector4;
    trim?: Vector4;
    rotated?: boolean;
    anchor?: Vector2;
  }): this {
    const texture = new Texture(
      this._baseTexture,
      data.frame,
      data.orig,
      data.trim,
      data.rotated ? -Math.PI / 2 : 0,
      data.anchor,
    );

    this.textures[data.name] = texture;
    TextureCache.add(data.name, texture);

    return this;
  }

  addAnimation(anim: AnimationClip): this {
    this.animations[anim.name] = anim;
    return this;
  }

  get baseTexture(): BaseTexture {
    return this._baseTexture;
  }

  dispose(): void {
    for (const key in this.textures) {
      TextureCache.remove(this.textures[key]);
      this.textures[key].dispose();
    }

    if (this._disposeBase) {
      TextureCache.remove(this._baseTexture);
      this._baseTexture.dispose();
    }

    this.textures = null;
    this.animations = null;
    this._baseTexture = null;
  }
}
