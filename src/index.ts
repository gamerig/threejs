import { Renderer } from './renderer/Renderer';
import { Disposables } from './scene/Disposables';
import { ViewManager } from './scene/ViewManager';

/**
 * Core scene augmentation.
 */
declare module '@gamerig/core' {
  interface Scene {
    readonly views: ViewManager;
    readonly renderer: Renderer;
    readonly disposables: Disposables;
  }
}

export * from './animation';
export { BaseCameraMixin, Camera } from './camera/Camera';
export { OrthographicCamera } from './camera/OrthographicCamera';
export { PerspectiveCamera } from './camera/PerspectiveCamera';
export { ObservableVector2, ObservableVector3, ObservableVector4 } from './math/ObservableVector';
export { Renderer } from './renderer/Renderer';
export { RendererEvent } from './renderer/RendererEvent';
export { RendererOptions } from './renderer/RendererOptions';
export { RenderingModule } from './RenderingModule';
export { RenderingOptions } from './RenderingOptions';
export { View } from './scene/View';
export { ViewManager } from './scene/ViewManager';
export { BaseTexture } from './texture/BaseTexture';
export { Texture } from './texture/Texture';
export { TextureCache } from './texture/TextureCache';
export * from './types';
