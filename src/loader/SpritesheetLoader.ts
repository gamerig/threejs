import { FileLoader, Loader, LoadingManager, Vector2 } from 'three';

import { Spritesheet, SpritesheetFactory, SpritesheetJson } from '../spritesheet';
import { Texture } from '../texture';
import { TextureLoader } from './TextureLoader';

type FrameSpec = {
  prefix: string;
  width: number;
  height: number;
  count?: number;
  anchor?: Vector2;
};

export class SpritesheetLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager);
  }

  load(url: string, onLoad?: (spritesheet: Spritesheet) => void, onProgress?: any, onError?: any) {
    const jsonLoader = new FileLoader(this.manager);
    jsonLoader.setPath(this.path);
    jsonLoader.setResponseType('json');
    jsonLoader.setWithCredentials(this.withCredentials);
    jsonLoader.setCrossOrigin(this.crossOrigin);
    jsonLoader.setRequestHeader(this.requestHeader);

    const textureLoader = new TextureLoader(this.manager);
    textureLoader.setCrossOrigin(this.crossOrigin);
    textureLoader.setPath(this.path);
    textureLoader.setWithCredentials(this.withCredentials);
    textureLoader.setRequestHeader(this.requestHeader);

    jsonLoader
      .loadAsync(url, onProgress)
      .then((json) => {
        const spec = json as any as SpritesheetJson;
        const imageUrl = spec.meta.image;

        textureLoader
          .loadAsync(imageUrl, onProgress)
          .then((texture) => {
            const spritesheet = SpritesheetFactory.fromJson(texture, spec);

            if (onLoad) {
              onLoad(spritesheet);
            }
          })
          .catch(onError);
      })
      .catch(onError);
  }

  loadWithFrame(
    imageUrl: string,
    frame: FrameSpec,
    onLoad: (spritesheet: Spritesheet) => any,
    onProgress?: any,
    onError?: any,
  ) {
    const textureLoader = new TextureLoader(this.manager);
    textureLoader.setCrossOrigin(this.crossOrigin);
    textureLoader.setPath(this.path);
    textureLoader.setWithCredentials(this.withCredentials);
    textureLoader.setRequestHeader(this.requestHeader);

    textureLoader
      .loadAsync(imageUrl, onProgress)
      .then((texture: Texture) => {
        const spritesheet = SpritesheetFactory.fromFixedFrames(texture, {
          framePrefix: frame.prefix,
          frameWidth: frame.width,
          frameHeight: frame.height,
          count: frame.count,
          anchor: frame.anchor.clone(),
        });

        if (onLoad) {
          onLoad(spritesheet);
        }
      })
      .catch(onError);
  }

  loadWithJson(
    imageUrl: string,
    jsonUrl: string,
    onLoad?: (spritesheet: Spritesheet) => void,
    onProgress?: any,
    onError?: any,
  ) {
    const textureLoader = new TextureLoader(this.manager);
    textureLoader.setCrossOrigin(this.crossOrigin);
    textureLoader.setPath(this.path);
    textureLoader.setWithCredentials(this.withCredentials);
    textureLoader.setRequestHeader(this.requestHeader);

    const jsonLoader = new FileLoader(this.manager);
    jsonLoader.setPath(this.path);
    jsonLoader.setResponseType('json');
    jsonLoader.setWithCredentials(this.withCredentials);
    jsonLoader.setCrossOrigin(this.crossOrigin);
    jsonLoader.setRequestHeader(this.requestHeader);

    Promise.all([
      textureLoader.loadAsync(imageUrl, onProgress),
      jsonLoader.loadAsync(jsonUrl, onProgress),
    ])
      .then(([texture, json]) => {
        const spritesheet = SpritesheetFactory.fromJson(texture, json as any);

        if (onLoad) {
          onLoad(spritesheet);
        }
      })
      .catch(onError);
  }
}
