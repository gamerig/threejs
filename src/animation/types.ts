export type AnimationTrackJson = {
  type: string;
  name: string;
  values: string[] | number[] | boolean[];
  times: number[];
  interpolation?: number;
};

export type AnimationClipJson = {
  name: string;
  uuid?: string;
  fps?: number;
  duration?: number;
  blendMode?: number;
  tracks: AnimationTrackJson[];
};
