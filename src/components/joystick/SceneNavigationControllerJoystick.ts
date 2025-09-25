import {
    SceneNavigationController,
    type SceneNavigationControllerOptions
} from "ria-toolbox/libs/scene-navigation/SceneNavigationController";

import type {Gizmos} from "ria-toolbox/libs/scene-navigation/AnchorSupport";
import {Bounds} from "@luciad/ria/shape/Bounds.js";
import {JoystickPanSupport} from "./JoystickPanSupport.ts";
import type {WebGLMap} from "@luciad/ria/view/WebGLMap.js";



export class SceneNavigationControllerJoystick extends SceneNavigationController {
    private joystickPanSupport: JoystickPanSupport;

    constructor(gizmos: Gizmos, bounds: Bounds, options: SceneNavigationControllerOptions) {
        super(gizmos, bounds, options);
        this.joystickPanSupport = new JoystickPanSupport(bounds);
    }

    onActivate(map: WebGLMap) {
        super.onActivate(map);
        this.joystickPanSupport.setMap(map)
    }

    onDeactivate(map: WebGLMap) {
        super.onDeactivate(map);
        this.joystickPanSupport.setMap(null)
    }

    getJoystickPanSupport() {
        return this.joystickPanSupport
    }

}
