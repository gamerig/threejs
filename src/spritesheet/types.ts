import { AnimationClipJson } from '../animation';

export type SpritesheetFrameJson = {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  rotated?: boolean;
  trimmed?: boolean;
  spriteSourceSize?: {
    x: number;
    y: number;
  };
  sourceSize?: {
    w: number;
    h: number;
  };
  anchor?: {
    x: number;
    y: number;
  };
};

export type SpritesheetJson = {
  frames: { [name: string]: SpritesheetFrameJson };
  animations?: { [name: string]: string[] | AnimationClipJson };
  meta: {
    scale: number;
  };
};
