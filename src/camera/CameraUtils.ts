import { Camera as BaseCamera } from 'three';

import { Camera } from './Camera';

export const isCamera = (obj: any): obj is Camera => {
  return obj instanceof BaseCamera && obj.userData.isGamerigCamera === true;
};
