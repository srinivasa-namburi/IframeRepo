import type { WebGLMap } from "@luciad/ria/view/WebGLMap.js";
import { PerspectiveCamera } from "@luciad/ria/view/camera/PerspectiveCamera.js";
import type { Handle } from "@luciad/ria/util/Evented.js";

export interface CameraAngles {
  yaw: number;
  roll: number;
  pitch: number;
}

export class CameraChangeDetectionManager {
  private handle: Handle | null = null;
  private lastAngles: CameraAngles | null = null;

  /**
   * Registers a listener that will be called whenever the camera's yaw, pitch, or roll changes.
   * If called multiple times, previous listener is removed automatically.
   */
  public setCameraUpdatedListener(
      map: WebGLMap | null,
      callback: (angles: CameraAngles) => void
  ): void {
    // Remove previous listener
    this.handle?.remove();
    this.handle = null;
    this.lastAngles = null;

    if (!map) return;

    // Notify immediately with current camera state
    this._notifyCameraAngles(map, callback);

    // Listen for all map changes (this will cover camera moves, keyboard, joystick, or mouse)
    const cameraUpdateHandler = () => this._notifyCameraAngles(map, callback);
    this.handle = map.on("MapChange", cameraUpdateHandler);
  }

  /**
   * Checks camera angles and only calls the callback if angles changed.
   */
  private _notifyCameraAngles(map: WebGLMap, callback: (angles: CameraAngles) => void) {
    if (!(map.camera instanceof PerspectiveCamera)) {
      return;
    }

    const lookFrom = map.camera.asLookFrom();
    const currentAngles: CameraAngles = {
      yaw: lookFrom.yaw ?? 0,
      roll: lookFrom.roll ?? 0,
      pitch: lookFrom.pitch ?? 0,
    };

    // Only trigger callback if angles changed
    if (
        !this.lastAngles ||
        currentAngles.yaw !== this.lastAngles.yaw ||
        currentAngles.roll !== this.lastAngles.roll ||
        currentAngles.pitch !== this.lastAngles.pitch
    ) {
      this.lastAngles = currentAngles;
      callback(currentAngles);
    }
  }

  public destroy() {
    this.handle?.remove();
    this.handle = null;
    this.lastAngles = null;
  }
}
