import type { WebGLMap } from "@luciad/ria/view/WebGLMap.js";

const CUSTOM_NEAR_PLANE = 0.1;
const HEIGHT_THRESHOLD = 100.0;

/**
 * Manages dynamic adjustment of the WebGLMap camera's near plane.
 */
export class CameraNearPlaneManager {
  private _cameraNear: number = CUSTOM_NEAR_PLANE;

  public setCameraNearPlane(map: WebGLMap | null): void {
    if (!map) return;

    const defineCameraNear = () => {
      const height = map.camera.eyePoint.z;
      const nearRaw =
        height > HEIGHT_THRESHOLD ? height * 0.01 : CUSTOM_NEAR_PLANE;

      const near = Math.round(nearRaw * 100) / 100; // round to 2 decimals

      if (near !== this._cameraNear) {
        map.camera = map.camera.copyAndSet({ near });
        this._cameraNear = near;
      }
    };

    // Disable automatic depth range adjustment
    map.adjustDepthRange = false;

    // Set initial near plane
    map.camera = map.camera.copyAndSet({ near: CUSTOM_NEAR_PLANE });
    this._cameraNear = CUSTOM_NEAR_PLANE;

    // Listen for map changes
    map.on("MapChange", defineCameraNear);
  }
}
