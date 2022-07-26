import { ImageLoader, Loader, LoadingManager } from 'three';

import { GlobalTextureManager, Texture } from '../texture';

export class TextureLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager);
  }

  load(url: string, onLoad?: any, onProgress?: any, onError?: any) {
    const texture = new Texture();

    const loader = new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);

    loader.load(
      url,
      function (image) {
        texture.baseTexture.image = image;
        texture.baseTexture.needsUpdate = true;

        GlobalTextureManager.add(url, texture);
        GlobalTextureManager.add(texture.uuid, texture);

        if (onLoad !== undefined) {
          onLoad(texture);
        }
      },
      onProgress,
      onError,
    );

    return texture;
  }
}
