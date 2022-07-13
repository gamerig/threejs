import { Vector2, Vector4 } from 'three';

import { AnimationClipFactory, AnimationClipJson } from '../animation';
import { BaseTexture, Texture } from '../texture';
import { Spritesheet } from './Spritesheet';
import { SpritesheetFrameJson, SpritesheetJson } from './types';

export const fromJson = (atlas: BaseTexture | Texture, json: SpritesheetJson): Spritesheet => {
  const spritesheet = new Spritesheet(atlas);

  const frames = json.frames;
  const frameKeys = Object.keys(json.frames);

  for (let i = 0; i < frameKeys.length; i++) {
    const name = frameKeys[i];
    const data = frames[i];

    parseJsonFrame(spritesheet, name, data);
  }

  parseAnimations(spritesheet, json);

  return spritesheet;
};

export const fromFixedFrames = (
  atlas: BaseTexture | Texture,
  options: {
    framePrefix: string;
    frameWidth: number;
    frameHeight: number;
    count?: number;
    anchor?: Vector2;
  },
): Spritesheet => {
  const spritesheet = new Spritesheet(atlas);
  const rows = Math.floor(spritesheet.baseTexture.image.height / options.frameHeight);
  const cols = Math.floor(spritesheet.baseTexture.image.width / options.frameWidth);
  const total = options.count || rows * cols;

  const keys = [];
  for (let i = 0; i < total; i++) {
    const name = `${options.framePrefix}_${i}`;
    keys.push(name);

    const frame = new Vector4(
      (i % cols) * options.frameWidth,
      Math.floor(i / cols) * options.frameHeight,
      options.frameWidth,
      options.frameHeight,
    );

    spritesheet.addFrame({
      name,
      frame,
      anchor: options.anchor ?? new Vector2(0, 0),
    });
  }

  spritesheet.addAnimation(AnimationClipFactory.fromTextureFrames(options.framePrefix, keys));

  return spritesheet;
};

const parseJsonFrame = (
  spritesheet: Spritesheet,
  name: string,
  data: SpritesheetFrameJson,
): void => {
  const rect = data.frame;

  if (rect) {
    let frame = null;
    let trim = null;
    const sourceSize = !!data.trimmed && data.sourceSize ? data.sourceSize : data.frame;

    const orig = new Vector4(0, 0, Math.floor(sourceSize.w), Math.floor(sourceSize.h));

    if (data.rotated) {
      frame = new Vector4(
        Math.floor(rect.x),
        Math.floor(rect.y),
        Math.floor(rect.h),
        Math.floor(rect.w),
      );
    } else {
      frame = new Vector4(
        Math.floor(rect.x),
        Math.floor(rect.y),
        Math.floor(rect.w),
        Math.floor(rect.h),
      );
    }

    //  Check to see if the sprite is trimmed
    if (!!data.trimmed && data.spriteSourceSize) {
      trim = new Vector4(
        Math.floor(data.spriteSourceSize.x),
        Math.floor(data.spriteSourceSize.y),
        Math.floor(rect.w),
        Math.floor(rect.h),
      );
    }

    spritesheet.addFrame({
      name,
      frame,
      orig,
      trim,
      rotated: data.rotated,
      anchor: data.anchor
        ? new Vector2(data.anchor.x, data.anchor.y).clampScalar(0, 1)
        : new Vector2(0, 0),
    });
  }
};

const parseAnimations = (spritesheet: Spritesheet, json: SpritesheetJson): void => {
  const animations = json.animations || {};

  for (const animName in animations) {
    if (Array.isArray(animations[animName])) {
      const frames = animations[animName] as string[];

      spritesheet.addAnimation(AnimationClipFactory.fromTextureFrames(animName, frames));
    } else {
      spritesheet.addAnimation(
        AnimationClipFactory.fromJson(animations[animName] as AnimationClipJson),
      );
    }
  }
};
