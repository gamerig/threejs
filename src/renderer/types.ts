export enum RendererEvent {
  CanvasResized = 'canvasResized',
  AspectChanged = 'aspectChanged',
  ResolutionChanged = 'resolutionChanged',
}

export enum ScaleMode {
  None,
  Fit,
  FitWidth,
  FitHeight,
  Fill,
  Stretch,
}

export enum Center {
  None,
  Horizontal,
  Vertical,
  Both,
}

export enum ClearFlag {
  None = 0,
  Depth,
  Color,
}
