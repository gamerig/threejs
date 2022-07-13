import { Scene as BaseScene } from 'three';

import { Camera } from '../cameras';

export class Scene extends BaseScene {
  cameras: Camera[] = [];
  sortCameras = true;
}
