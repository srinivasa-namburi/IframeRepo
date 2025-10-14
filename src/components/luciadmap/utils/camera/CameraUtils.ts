import {createBounds, createPoint} from "@luciad/ria/shape/ShapeFactory.js";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import {WebGLMap} from "@luciad/ria/view/WebGLMap.js";
import {AnimationManager} from "@luciad/ria/view/animation/AnimationManager.js";
import type {PerspectiveCamera} from "@luciad/ria/view/camera/PerspectiveCamera.js";
import type {Point} from "@luciad/ria/shape/Point.js";
import {Move3DCameraAnimation} from "ria-toolbox/libs/controller/animation/Move3DCameraAnimation";

export function calculateRecommendedBounds(layer: TileSet3DLayer) {
    let limitBounds = layer.bounds.copy();
    let targetBounds = layer.bounds.copy();
    const scale = 5;
    const targetScale = 0.025;
    if (limitBounds.depth === 0) {
        limitBounds = createBounds(limitBounds.reference, [
            limitBounds.x - (scale - 1) * limitBounds.width / 2, limitBounds.width * scale,
            limitBounds.y - (scale - 1) * limitBounds.height / 2, limitBounds.height * scale,
            -10000, 20000,
        ])
        targetBounds = createBounds(targetBounds.reference, [
            targetBounds.x - (targetScale - 1) * targetBounds.width / 2, targetBounds.width * targetScale,
            targetBounds.y - (targetScale - 1) * targetBounds.height / 2, targetBounds.height * targetScale,
            -10000, 20000
        ]);
    } else {
        limitBounds = createBounds(limitBounds.reference, [
            limitBounds.x - (scale - 1) * limitBounds.width / 2, limitBounds.width * scale,
            limitBounds.y - (scale - 1) * limitBounds.height / 2, limitBounds.height * scale,
//            limitBounds.z - ((scale*2) - 1) * limitBounds.depth / 2, limitBounds.depth * scale *2
            limitBounds.z , limitBounds.depth * scale
        ]);
        targetBounds = createBounds(targetBounds.reference, [
            targetBounds.x - (targetScale - 1) * targetBounds.width / 2, targetBounds.width * targetScale,
            targetBounds.y - (targetScale - 1) * targetBounds.height / 2, targetBounds.height * targetScale,
            // targetBounds.z - ((targetScale*2) - 1) * targetBounds.depth / 2, targetBounds.depth * targetScale *2
            targetBounds.z + targetBounds.depth / 3 - (targetBounds.depth * targetScale * 2) / 2,
            targetBounds.depth * targetScale * 2
        ]);
    }

    return {limitBounds, targetBounds}
}

export type Camera_Face_Type = "front" | "back" | "left" | "right"

interface CameraPreferredSpotOptions {
    map: WebGLMap | null;
    layer: TileSet3DLayer;
    percent?: number;
    pitch?: number;    // optional camera pitch (default -65)
    face?: Camera_Face_Type; // which face top edge
    duration?: number;
}


export function setCameraOnPreferredSpot({
                                             map,
                                             layer,
                                             percent = 300,
                                             pitch = 0,
                                             face = "front",
                                             duration = 0,
                                         }: CameraPreferredSpotOptions) {
    if (!map) return;
    const {limitBounds} = calculateRecommendedBounds(layer);

    const x0 = layer.bounds.focusPoint.x;
    const y0 = layer.bounds.focusPoint.y;
    const z0 = layer.bounds.focusPoint.z;

    const bounds = layer.bounds.copy();

    // let x1 = limitBounds.x;
    // let y1 = limitBounds.y;
    // const z1 = limitBounds.z + limitBounds.depth;
    // let x2 = limitBounds.x + limitBounds.width;
    // let y2 = limitBounds.y;
    // let yaw = 0;

    let x1 = bounds.x;
    let y1 = bounds.y;
    const z1 = bounds.z + bounds.depth * 0.5 ;
    let x2 = bounds.x + bounds.width;
    let y2 = bounds.y;
    let yaw = 0;


    switch (face) {
        case "back":
            x1 = bounds.x + bounds.width;
            y1 = bounds.y + bounds.width;
            x2 = bounds.x ;
            y2 = bounds.y + bounds.width;
            yaw = 180;
            break;
        case "right":
            x1 = bounds.x + bounds.width;
            y1 = bounds.y ;
            x2 = bounds.x + bounds.width;
            y2 = bounds.y + bounds.width;
            yaw = -90;
            break;
        case "left":
            x1 = bounds.x  ;
            y1 = bounds.y + bounds.width;
            x2 = bounds.x ;
            y2 = bounds.y ;
            yaw = 90;
            break;
    }

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const targetPoint = pointBetweenFocusAndCenter3D(x0, y0, z0, centerX, centerY, z1, percent);

    const point = createPoint(limitBounds.reference, [targetPoint.x, targetPoint.y, targetPoint.z]);

    return setCameraLocation({map, point, pitch, yaw, duration});
}


function pointBetweenFocusAndCenter3D(
    x0: number, y0: number, z0: number,
    centerX: number, centerY: number, centerZ: number,
    percent: number
) {
    const t = percent / 100;
    const x = x0 + t * (centerX - x0);
    const y = y0 + t * (centerY - y0);
    const z = z0 + t * (centerZ - z0);
    return { x, y, z };
}

interface CameraLocationOptions {
    map: WebGLMap;
    point: Point;
    yaw: number;
    pitch: number;
    duration?: number
}

function setCameraLocation({ map, point, yaw=0, pitch, duration=0 }: CameraLocationOptions) {
    const moveToAnimation = new Move3DCameraAnimation(
        map,
        point,
        yaw,                                // yaw
        pitch,
        0,                                // roll
        (map.camera as PerspectiveCamera).fovY,
        duration,                                // duration?
    );
    return AnimationManager.putAnimation(map.cameraAnimationKey, moveToAnimation, false);
}

