import { BaseTexture } from './BaseTexture';

class TextureManager {
  private _cache: { [id: string]: BaseTexture } = {};

  add(id: string, texture: BaseTexture): void {
    if (this.has(id)) {
      console.warn(`TextureCache: ${id} was already added to the cache.`);
      this._cache[id].textureCacheIds.splice(this._cache[id].textureCacheIds.indexOf(id), 1);
    }

    if (texture.textureCacheIds.indexOf(id) === -1) {
      texture.textureCacheIds.push(id);
    }

    this._cache[id] = texture;
  }

  get(id: string): BaseTexture | undefined {
    return this._cache[id];
  }

  has(id: string): boolean {
    return !!this._cache[id];
  }

  remove(textureOrId: string | BaseTexture): void {
    if (typeof textureOrId === 'string') {
      const texture = this._cache[textureOrId];
      if (!texture) {
        return;
      }

      texture.textureCacheIds.splice(texture.textureCacheIds.indexOf(textureOrId), 1);
      delete this._cache[textureOrId];
      return;
    } else {
      textureOrId.textureCacheIds.forEach((id) => {
        if (this._cache[id] === textureOrId) {
          delete this._cache[id];
        }
      });

      textureOrId.textureCacheIds = [];
    }
  }

  clear(): void {
    Object.entries(this._cache).forEach(([, texture]) => {
      texture.textureCacheIds = [];
    });

    this._cache = {};
  }
}

const GlobalTextureManager = new TextureManager();
const GlobalBaseTextureManager = new TextureManager();

export { GlobalBaseTextureManager, GlobalTextureManager, TextureManager };
