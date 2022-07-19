import {
  Mapping,
  PixelFormat,
  Texture,
  TextureDataType,
  TextureEncoding,
  TextureFilter,
  Wrapping,
} from 'three';

export class BaseTexture extends Texture {
  textureCacheIds: string[] = [];

  private readonly updateProps = [
    'wrapS',
    'wrapT',
    'magFilter',
    'minFilter',
    'format',
    'type',
    'anisotropy',
    'encoding',
    'image',
  ];

  constructor(
    image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: TextureFilter,
    minFilter?: TextureFilter,
    format?: PixelFormat,
    type?: TextureDataType,
    anisotropy?: number,
    encoding?: TextureEncoding,
  ) {
    super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);

    const instance = new Proxy(this, {
      set: (target, property, value) => {
        const res = Reflect.set(target, property, value);

        if (res && this.updateProps.includes(property as string)) {
          this.update();
        }

        if (property === 'needsUpdate' && value === true) {
          this.update();
        }

        return res;
      },
    });

    return instance;
  }

  update(): void {
    if (!!this.image) {
      this.needsUpdate = true;
      this.dispatchEvent({ type: 'update', target: this });
    }
  }
}
