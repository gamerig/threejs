import {
  AnimationClip,
  BooleanKeyframeTrack,
  ColorKeyframeTrack,
  KeyframeTrack,
  MathUtils,
  NumberKeyframeTrack,
  QuaternionKeyframeTrack,
  StringKeyframeTrack,
  VectorKeyframeTrack,
} from 'three';

import { AnimationSettings } from './AnimationSettings';
import { AnimationClipJson, AnimationTrackJson } from './types';

const fromTextureFrames = (
  name: string,
  keys: string[],
  options?: {
    property?: string;
    fps?: number;
  },
): AnimationClip => {
  const times = [];
  const values = [];

  const frameTime = 1.0 / options?.fps ?? AnimationSettings.DEFAULT_FPS;
  for (let i = 0; i < keys.length; i++) {
    times.push(i);
    values.push(keys[i]);
  }

  const track = new StringKeyframeTrack(options?.property ?? '.material.map', times, values);
  track.scale(frameTime);
  track.ValueTypeName = 'texture';

  return new AnimationClip(name, -1, [track]);
};

const fromJson = (json: AnimationClipJson): AnimationClip => {
  const tracks = [],
    jsonTracks = json.tracks,
    frameTime = 1.0 / (json.fps || 1.0);

  for (let i = 0; i < jsonTracks.length; i++) {
    tracks.push(parseKeyframeTrack(jsonTracks[i]).scale(frameTime));
  }

  const clip = new AnimationClip(json.name, json.duration ?? -1, tracks, json.blendMode);
  clip.uuid = json.uuid ?? MathUtils.generateUUID();

  return clip;
};

const parseKeyframeTrack = (json: AnimationTrackJson): KeyframeTrack => {
  if (json.type === undefined) {
    throw new Error('THREE.KeyframeTrack: track type undefined, can not parse');
  }

  const trackType = getTrackTypeForValueTypeName(json.type);

  const track = new trackType(json.name, json.times, json.values, json.interpolation);
  track.ValueTypeName = json.type.toLowerCase();

  return track;
};

const getTrackTypeForValueTypeName = (typeName: string) => {
  switch (typeName.toLowerCase()) {
    case 'scalar':
    case 'double':
    case 'float':
    case 'number':
    case 'integer':
      return NumberKeyframeTrack;

    case 'vector':
    case 'vector2':
    case 'vector3':
    case 'vector4':
      return VectorKeyframeTrack;

    case 'color':
      return ColorKeyframeTrack;

    case 'quaternion':
      return QuaternionKeyframeTrack;

    case 'bool':
    case 'boolean':
      return BooleanKeyframeTrack;

    case 'string':
    case 'texture':
      return StringKeyframeTrack;
  }

  throw new Error('THREE.KeyframeTrack: Unsupported typeName: ' + typeName);
};

export { fromJson, fromTextureFrames };
