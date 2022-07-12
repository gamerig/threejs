import { BaseTexture } from './BaseTexture';

class _TextureCache {
  private _cache: { [uuid: string]: BaseTexture } = {};

  add(uuid: string, texture: BaseTexture): void {
    if (this.has(uuid)) {
      console.warn(`TextureCache: ${uuid} was already added to the cache.`);
    }

    this._cache[uuid] = texture;
  }

  get(uuid: string): BaseTexture | undefined {
    return this._cache[uuid];
  }

  has(uuid: string): boolean {
    return !!this._cache[uuid];
  }

  remove(uuid: string): void {
    delete this._cache[uuid];
  }

  clear(): void {
    this._cache = {};
  }
}

const TextureCache = new _TextureCache();

export { TextureCache };
