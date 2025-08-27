import type {PerspectiveCamera} from "@luciad/ria/view/camera/PerspectiveCamera.js";
import {createCartesianGeodesy} from "@luciad/ria/geodesy/GeodesyFactory.js";
import {getReference} from "@luciad/ria/reference/ReferenceProvider.js";
import {AnimationManager} from "@luciad/ria/view/animation/AnimationManager.js";
import {QuickLookAnimation} from "./QuickLookAnimation.ts";
import {LocationMode} from "@luciad/ria/transformation/LocationMode.js";
import {createPoint} from "@luciad/ria/shape/ShapeFactory.js";
import type {WebGLMap} from "@luciad/ria/view/WebGLMap.js";

// const CARTESIAN_GEODESY = createCartesianGeodesy(getReference("EPSG:4978"));
const XYZProjection = "LUCIAD:XYZ";

const CARTESIAN_GEODESY = createCartesianGeodesy(getReference(XYZProjection));
const ANIMATION_DURATION = 500; //ms

export function helicopterPerspective(map: WebGLMap) {
    const perspectiveAnimation = createPerspectiveAnimation(map, -89);
    AnimationManager.putAnimation(map.cameraAnimationKey, perspectiveAnimation, false);
}

export function carPerspective(map: WebGLMap) {
    const perspectiveAnimation = createPerspectiveAnimation(map, 0.01);
    AnimationManager.putAnimation(map.cameraAnimationKey, perspectiveAnimation, false);
}

function createPerspectiveAnimation(map: WebGLMap, targetPitch: number) {
   // const ref = getCenterScreenInMapCoords(map);
    const ref = createPoint(map.reference, [0,0,0]);
    const eye = map.camera.eyePoint;
    const distance = CARTESIAN_GEODESY.distance3D(ref, eye);
    const lookAt = (map.camera as PerspectiveCamera).asLookAt(distance);
    return new QuickLookAnimation(
        map,
        ref,
        targetPitch,
        lookAt.yaw,
        distance,
        distance,
        ANIMATION_DURATION
    );
}

// function getCenterScreenInMapCoords(map: WebGLMap) {
//     return map.getViewToMapTransformation(LocationMode.CLOSEST_SURFACE).transform(
//         createPoint(null, [map.viewSize[0] / 2, map.viewSize[1] / 2]));
// }

export function turn(map: WebGLMap, quadrants: number) {
//    const ref = getCenterScreenInMapCoords(map);
    const ref = createPoint(map.reference, [0,0,0]);
    const eye = map.camera.eyePoint;
    const distance = CARTESIAN_GEODESY.distance3D(ref, eye);
    const lookAt = (map.camera as PerspectiveCamera).asLookAt(distance);
    const animation = new QuickLookAnimation(
        map,
        ref,
        lookAt.pitch, (Math.round(lookAt.yaw / 90) + quadrants) * 90,
        distance,
        distance,
        ANIMATION_DURATION
    );
    AnimationManager.putAnimation(map.cameraAnimationKey, animation, false);
}
