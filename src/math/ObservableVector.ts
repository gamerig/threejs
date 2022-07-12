import { Vector2, Vector3, Vector4 } from 'three';

export class ObservableVector2 extends Vector2 {
  _cb: (v: Vector2) => void;

  constructor(x: number, y: number, cb: (v: Vector2) => void) {
    super(x, y);
    this._cb = cb;

    return new Proxy(this, {
      set(target, key, value) {
        const res = Reflect.set(target, key, value);

        if (key === 'x' || key === 'y') {
          target._cb(target);
        }

        return res;
      },
    });
  }

  static copy(v: Vector2, cb: (v: Vector2) => void): ObservableVector2 {
    return new ObservableVector2(v.x, v.y, cb);
  }
}

export class ObservableVector3 extends Vector3 {
  _cb: (v: Vector3) => void;

  constructor(x: number, y: number, z: number, cb: (v: Vector3) => void) {
    super(x, y, z);
    this._cb = cb;

    return new Proxy(this, {
      set(target, key, value) {
        const res = Reflect.set(target, key, value);

        if (key === 'x' || key === 'y' || key === 'z') {
          target._cb(target);
        }

        return res;
      },
    });
  }

  static copy(v: Vector3, cb: (v: Vector3) => void): ObservableVector3 {
    return new ObservableVector3(v.x, v.y, v.z, cb);
  }
}

export class ObservableVector4 extends Vector4 {
  _cb: (v: Vector4) => void;

  constructor(x: number, y: number, z: number, w: number, cb: (v: Vector4) => void) {
    super(x, y, z, w);
    this._cb = cb;

    return new Proxy(this, {
      set(target, key, value) {
        const res = Reflect.set(target, key, value);

        if (key === 'x' || key === 'y' || key === 'z' || key === 'w') {
          target._cb(target);
        }

        return res;
      },
    });
  }

  static copy(v: Vector4, cb: (v: Vector4) => void): ObservableVector4 {
    return new ObservableVector4(v.x, v.y, v.z, v.w, cb);
  }
}
