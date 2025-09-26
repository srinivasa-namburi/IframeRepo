import { Map } from "@luciad/ria/view/Map.js";
import {
    add,
    scale,
    cross,
    normalize
} from "ria-toolbox/libs/core/util/Vector3Util";
import { Bounds } from "@luciad/ria/shape/Bounds.js";
import { BoundedCameraSupport } from "ria-toolbox/libs/scene-navigation/camera/BoundedCameraSupport";
import type {WebGLMap} from "@luciad/ria/view/WebGLMap.js";
import {ReferenceType} from "@luciad/ria/reference/ReferenceType.js";
import {clamp} from "ria-toolbox/libs/core/util/Math";

const JOYSTICK_ROTATION_SCALING = 1.5;

export class JoystickPanSupport extends BoundedCameraSupport {
    private _map: Map | null = null;
    private _moveUpActive = false;
    private _moveDownActive = false;
    private _intervalId: number | null = null;

    private _sensitivity = 0.075;
    private _upDownStep = 0.05;
    private _tickMs = 50;

    constructor(
        bounds: Bounds | null,
        opts?: { sensitivity?: number; upDownStep?: number; tickMs?: number }
    ) {
        super(bounds); // ✅ pass bounds to parent

        if (opts?.sensitivity !== undefined) this._sensitivity = opts.sensitivity;
        if (opts?.upDownStep !== undefined) this._upDownStep = opts.upDownStep;
        if (opts?.tickMs !== undefined) this._tickMs = opts.tickMs;

        this._intervalId = window.setInterval(() => {
            if (!this._map) return;
            if (this._moveUpActive) this.panVertical(this._upDownStep);
            if (this._moveDownActive) this.panVertical(-this._upDownStep);
        }, this._tickMs);
    }

    public setMap(map: WebGLMap | null) {
        this._map = map;
    }


    public moveHorizontally(dx: number) {
        if (!this._map) return;
        const { camera } = this._map;
        const right = normalize(cross(camera.forward, camera.up));
        const distance = dx * this._sensitivity;
        const newEye = add(camera.eye, scale(right, distance));
        this.modifyCameraEye(this._map, newEye, true);
    }

    public moveVertically(dy: number) {
        if (!this._map) return;
        const { camera } = this._map;
        const distance = dy * this._sensitivity;
        const newEye = add(camera.eye, scale(camera.forward, distance));
        this.modifyCameraEye(this._map, newEye, true);
    }

    public setMoveUp(active: boolean) {
        this._moveUpActive = active;
    }

    public setMoveDown(active: boolean) {
        this._moveDownActive = active;
    }

    private panVertical(amount: number) {
        if (!this._map) return;
        const camera = this._map.camera;

        // Determine the vertical direction according to camera reference
        let verticalVec;
        if (camera.worldReference.referenceType === ReferenceType.GEOCENTRIC) {
            verticalVec = normalize(camera.eye);
        } else {
            verticalVec = { x: 0, y: 0, z: 1 };
        }

        // Apply the signed amount
        const newEye = add(camera.eye, scale(verticalVec, amount));
        this.modifyCameraEye(this._map, newEye, true);
    }

    public destroy() {
        if (this._intervalId !== null) {
            window.clearInterval(this._intervalId);
            this._intervalId = null;
        }
        this._map = null;
    }

    public rotateYaw(dx: number) {
        if (!this._map) return;
        const lookFromCamera = this._map.camera.asLookFrom();
        lookFromCamera.yaw = (lookFromCamera.yaw + dx * JOYSTICK_ROTATION_SCALING ) % 360;
        this.modifyCameraLookFrom(this._map, lookFromCamera);
    }

    public rotatePitch(dy: number) {
        if (!this._map) return;
        const lookFromCamera = this._map.camera.asLookFrom();
        lookFromCamera.pitch = clamp(
            lookFromCamera.pitch + dy * JOYSTICK_ROTATION_SCALING ,
            -89,
            89
        );
        this.modifyCameraLookFrom(this._map, lookFromCamera);
    }
}
