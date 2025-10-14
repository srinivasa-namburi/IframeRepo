import * as React from "react";
import {useEffect, useRef, useState} from "react";

import "./LuciadMap.scss"
import {WebGLMap} from "@luciad/ria/view/WebGLMap.js";
import {getReference} from "@luciad/ria/reference/ReferenceProvider.js";
import {createBounds} from "@luciad/ria/shape/ShapeFactory.js";
import {Feature} from "@luciad/ria/model/feature/Feature.js";
import {
    getPointCloudStyleParameters,
    getRequestInitValues,
    INITIAL_POINTCLOUD_STYLE_MODE,
    loadHSPC,
    loadOGC3dTiles, type PointCloudStyleParameters, setPointStyleMode,
    type StyleModeName
} from "./utils/HSPCLoader.ts";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import {loadLabels} from "./utils/LabelLoader.ts";
import {type BackgroundColor, ColorPickerFindColor} from "../colorpicker/ColorPicker.tsx";
import ROTATION_GLB from "ria-toolbox/libs/scene-navigation/gizmo/gizmo_circles.glb";
import PAN_GLB from "ria-toolbox/libs/scene-navigation/gizmo/gizmo_arrows.glb";
import SCROLL_GLB from "ria-toolbox/libs/scene-navigation/gizmo/gizmo_octhedron.glb";
import {NavigationKeysMode} from "ria-toolbox/libs/scene-navigation/KeyNavigationSupport";
import {NavigationGizmo} from "ria-toolbox/libs/scene-navigation/NavigationGizmo";
import {NavigationType} from "ria-toolbox/libs/scene-navigation/GestureUtil";
import {DefaultController} from "@luciad/ria/view/controller/DefaultController.js";
import {ShapeType} from "@luciad/ria/shape/ShapeType.js";
import type {Point} from "@luciad/ria/shape/Point.js";
import {ButtonSelectOptions, type SelectControlOptions} from "../select/ButtonSelectOptions.tsx";
import {SceneNavigationControllerJoystick} from "../joystick/SceneNavigationControllerJoystick.ts";
import type {JoystickPanSupport} from "../joystick/JoystickPanSupport.ts";
import {createAxes, createSky} from "./utils/createSettings.ts";
import {createEffects} from "./utils/createSettings.ts";
import {CameraNearPlaneManager} from "./utils/CameraNearPlaneManager.ts";
import {VerticalGradient} from "../gradient/VerticalGradient.tsx";
import {useDeviceOrientationContext} from "ipad-device-orientation";
import {getTilesetQualityFromUrl} from "./utils/meshurlparsr/MeshUrlParser.ts";
import {VolumeBanner} from "../volumebanner/VolumeBanner.tsx";
import {calculateRecommendedBounds, setCameraOnPreferredSpot} from "./utils/camera/CameraUtils.ts";

const defaultProjection = "LUCIAD:XYZ";


const ModeSelectControlOptions: SelectControlOptions[] = [
    {value:"rgb", label:"RGB"},
    {value:"vertical", label:"Height"},
    {value:"intensity", label:"Intensity"},
];

const LayersMode: SelectControlOptions[] = [
    {value:"both", label:"Both"},
    {value:"cubes", label:"Cubes"},
    {value:"point-clouds", label:"Points"},
]

type LayerModeName =  "cubes" | "point-clouds" | "both";
const INITIAL_LAYER_MODE:LayerModeName = "both";

// Get reference from URL query params or default to EPSG:4978
const params = new URLSearchParams(window.location.search);
const referenceIdentifier = defaultProjection;

const hspcUrl = params.get("hspc") || null;
const ogc3dTilesUrl = params.get("3dtiles") || null;

const labelsUrl = params.get("labels") || null;
const requestInit = getRequestInitValues(params);

const reference = getReference(referenceIdentifier);

const AvailableBackgroundColors: BackgroundColor[] = [
    { value: "#1E1E1E", label: "Dark Gray", id: "#1E1E1E" },        // High contrast for greens
    { value: "#2E2E2E", label: "Charcoal", id: "#2E2E2E" },         // Neutral dark gray
    { value: "#7D7D7D", label: "Medium Gray", id: "#7D7D7D" },      // True neutral mid-tone gray
    { value: "#F0F4FF", label: "Soft Blue", id: "#F0F4FF" },        // Light cool, separates green leaves
    { value: "#FAF9F6", label: "Light Beige", id: "#FAF9F6" },
    {value: "#000000", label: "Sky", id: "$sky"},
];



// const LOCAL_STORAGE_BG_KEY = "point-cloud-viewer-background";

interface Props {
    onShowTime?: (status: boolean, errorMessage?: string) => void;
}

export const LuciadMap: React.FC<Props> = (props: Props) => {
    // const storedColor = localStorage.getItem(LOCAL_STORAGE_BG_KEY);
    const storedColor = "$sky";
    const [bgColor, /*setBgColor*/] = React.useState<BackgroundColor>(ColorPickerFindColor(AvailableBackgroundColors, storedColor));
    const joystickSupport = useRef(null as JoystickPanSupport | null | undefined);

    const [cubesNumber, setCubesNumber] = useState(null as number | null)

   // const [setCameraAngles] = useState({yaw:0, pitch:0, roll:0} as CameraAngles);
    const [styleMode, setStyleMode] =  useState(INITIAL_POINTCLOUD_STYLE_MODE as StyleModeName);

    const [layersMode, setLayersMode] =  useState(INITIAL_LAYER_MODE as LayerModeName);

    const [pcParameters, setpcParameters] = useState(undefined as PointCloudStyleParameters | undefined | null)

    const divRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<WebGLMap | null>(null);
    const [activeHSPCLayer, setActiveHSPCLayer] = useState<TileSet3DLayer | null>(null);
    const [active3DTilesLayer , setActive3DTilesLayer] = useState<TileSet3DLayer | null>(null);

    const { yaw, pitch, roll } = useDeviceOrientationContext();


    useEffect(()=>{
        if (joystickSupport.current) {
            joystickSupport.current.setOrientation({yaw, pitch, roll});  // your existing moveLeft/moveRight
        }
    }, [yaw, pitch, roll])

    const onClickZoom = (feature: Feature)=> {
        if (feature && feature.shape && feature.shape.bounds && mapRef.current) {
            if (feature.shape.type === ShapeType.POINT) {
                const delta = 1.2;
                const point = feature.shape as Point;
                const bounds = createBounds(feature.shape.reference, [
                    point.x - delta /2 , delta,
                    point.y - delta /2, delta,
                    point.z - delta /2 , delta])
                mapRef.current.mapNavigator.fit({bounds, animate: true});
            }
        }
        return false;
    }

    useEffect(() => {
        if (divRef.current) {
            mapRef.current = new WebGLMap(divRef.current, {reference});
            initMap(mapRef.current);
            createSky(mapRef.current, bgColor.id);

            if (hspcUrl) {
                loadHSPC(hspcUrl, requestInit).then(layer => {
                    try {
                        //Add the model to the map
                        mapRef.current?.layerTree.addChild(layer);
                        // Zoom to the point cloud location
                        mapRef.current?.mapNavigator.fit({bounds: layer.bounds, animate: false});
                        setActiveHSPCLayer(layer);
                        if (labelsUrl) loadLabels(labelsUrl, requestInit).then(labelsLayer => {
                            mapRef.current?.layerTree.addChild(labelsLayer);
                            labelsLayer.onClick = onClickZoom;
                        }).catch(()=>{
                            if (typeof props.onShowTime === "function") props.onShowTime(false);
                        })
                        joystickSupport.current = restrictBounds3D(mapRef.current, layer);
                        if (typeof props.onShowTime === "function") props.onShowTime(true);
                    }  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catch (_e) {
                        if (typeof props.onShowTime === "function") props.onShowTime(false);
                        if (mapRef.current && !layer.model.reference.equals(mapRef.current.reference)) {
                            console.log(`"Map and data are not in the same reference. Layer is in: ${layer.model.reference.identifier}`)
                        }
                    }
                }).catch(()=>{
                    if (typeof props.onShowTime === "function") props.onShowTime(false);
                    console.log(`Data unreachable`)
                });
            }
            if (ogc3dTilesUrl) {
                loadOGC3dTiles(ogc3dTilesUrl, requestInit).then(layer => {
                    try {
                        setCubesNumber(getTilesetQualityFromUrl(ogc3dTilesUrl));
                        //Add the model to the map
                        mapRef.current?.layerTree.addChild(layer);
                        // Zoom to the point cloud location
                        mapRef.current?.mapNavigator.fit({bounds: layer.bounds, animate: false});
                        setActive3DTilesLayer(layer);
                        if (labelsUrl) loadLabels(labelsUrl, requestInit).then(labelsLayer => {
                            labelsLayer.onClick = onClickZoom;
                            mapRef.current?.layerTree.addChild(labelsLayer);
                        });
                        const pcParameters = getPointCloudStyleParameters(layer);
                        setpcParameters(pcParameters);
                        joystickSupport.current = restrictBounds3D(mapRef.current, layer);
                        if (typeof props.onShowTime === "function") props.onShowTime(true);
                    } // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catch (_e) {
                        if (mapRef.current && !layer.model.reference.equals(mapRef.current.reference)) {
                            console.log(`"Map and data are not in the same reference. Layer is in: ${layer.model.reference.identifier}`)
                        }
                    }
                }).catch(()=>{
                    if (typeof props.onShowTime === "function") props.onShowTime(false);
                    console.log(`Data unreachable`)
                });
            } else {
                if (typeof props.onShowTime === "function") props.onShowTime(false, "Missing hspc or 3dtiles URL");
            }
        }
        return () => {
            if (mapRef.current) mapRef.current.destroy();
            mapRef.current = null;
        }
    }, []);

    // Update localStorage whenever the user changes the color
    // const handleColorChange = (color: BackgroundColor) => {
    //     setBgColor(color);
    //     createSky(mapRef.current, color.id)
    //     localStorage.setItem(LOCAL_STORAGE_BG_KEY, color.id);
    // };


    const initMap = (map: WebGLMap | null) => {
        if (!map) return;
        createEffects(map);
        createAxes(map);

        const manager = new CameraNearPlaneManager();
        manager.setCameraNearPlane(map);
    //    const cameraAngleDetector = new CameraChangeDetectionManager();

// Attach the listener to your map
//         cameraAngleDetector.setCameraUpdatedListener(map, (newCameraAngles: CameraAngles) => {
//             setCameraAngles(newCameraAngles);
//         });

        map.onClick = ()=> {
            map.domNode.focus();
            return false;
        }
    }


    const setStyleModeAction = (mode: StyleModeName)=> {
        if (activeHSPCLayer) {
            setStyleMode(mode);
            setPointStyleMode(activeHSPCLayer, mode);
            const pcParameters = getPointCloudStyleParameters(activeHSPCLayer);
            setpcParameters(pcParameters);
        }
        if (active3DTilesLayer) {
            setStyleMode(mode);
            setPointStyleMode(active3DTilesLayer, mode);
            const pcParameters = getPointCloudStyleParameters(active3DTilesLayer);
            setpcParameters(pcParameters);
        }
    }

    const setLayersModeAction = (mode: LayerModeName)=> {
        setLayersMode(mode);

        switch (mode) {
            case "both":
                if (activeHSPCLayer) activeHSPCLayer.visible = true;
                if (active3DTilesLayer) active3DTilesLayer.visible = true;
                break;
            case "cubes":
                if (activeHSPCLayer) activeHSPCLayer.visible = false;
                if (active3DTilesLayer) active3DTilesLayer.visible = true;
                break;
            case "point-clouds":
                if (activeHSPCLayer) activeHSPCLayer.visible = true;
                if (active3DTilesLayer) active3DTilesLayer.visible = false;
                break;
        }
    }



    return (
        <div className="LuciadMap">
            <div className="LuciadMapElement" ref={divRef} style={{backgroundColor: bgColor.value}} tabIndex={0} />
            <div style={{ position: "fixed", top: 16, left: 16, zIndex: 1000 }}>
                {/*<ColorPicker colors={AvailableBackgroundColors} currentColor={bgColor} onChange={handleColorChange} />*/}
                <VolumeBanner volume={cubesNumber} />
                {
                    (activeHSPCLayer && active3DTilesLayer) &&
                    <ButtonSelectOptions onChange={(mode)=> setLayersModeAction(mode as unknown as LayerModeName)} mode={layersMode} options={LayersMode}/>
                }
            </div>
            <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
                <ButtonSelectOptions onChange={(mode)=> setStyleModeAction(mode as unknown as StyleModeName)} mode={styleMode} options={ModeSelectControlOptions}/>
            </div>
            {pcParameters && <div style={{position: "fixed", top:70, right: 20, height: 320}}>

                <VerticalGradient gradient={pcParameters.gradient} min={pcParameters.min.value} max={pcParameters.max.value}/>
            </div>
            }
            {/*<ViewToolIBar mapRef={mapRef} layerState={activeHSPCLayer ? activeHSPCLayer : active3DTilesLayer}/>*/}
            {/*<MobileJoystickControls*/}
            {/*    onLeftJoystickMove={(dx, dy) => {*/}
            {/*        if (joystickSupport.current) {*/}
            {/*            // dx: left/right, dy: forward/back*/}
            {/*            joystickSupport.current.moveHorizontally(dx);  // your existing moveLeft/moveRight*/}
            {/*            joystickSupport.current.moveVertically(dy);    // your existing moveForward/moveBackward*/}
            {/*        }*/}
            {/*    }}*/}
            {/*    onRightJoystickMove={(dx, dy) => {*/}
            {/*        if (joystickSupport.current) {*/}
            {/*            // dx: left/right, dy: forward/back*/}
            {/*            joystickSupport.current.rotateYaw(dx);  // your existing moveLeft/moveRight*/}
            {/*            joystickSupport.current.rotatePitch(dy);    // your existing moveForward/moveBackward*/}
            {/*        }*/}
            {/*    }}*/}
            {/*    onUp={(active) => joystickSupport.current?.setMoveUp(active)}*/}
            {/*    onDown={(active) => joystickSupport.current?.setMoveDown(active)}*/}
            {/*/>*/}
            <div
                style={{
                    position: "fixed",
                    top: 10,
                    right: 10,
                    userSelect: "none", // optional: prevent text selection
                    display: "flex",          // ✅ children side by side
                    gap: "10px",
                }}
            >
                {/*<NavigationHelpPanel />*/}
                {/*<CubeAxesIndicator pitch={cameraAngles.pitch} roll={cameraAngles.roll} yaw={cameraAngles.yaw} opacity={1} size={70}/>*/}
            </div>
        </div>
    )
}


function restrictBounds3D(map: WebGLMap | null, layer: TileSet3DLayer) {
    if (!map) return;
    if (!layer.bounds) return;


    const {limitBounds} = calculateRecommendedBounds(layer);

    setCameraOnPreferredSpot({map, layer, face:"front"});


    // Declare the gizmos to use for the different navigation types.
    const gizmos = {
        [NavigationType.ROTATION]: new NavigationGizmo(ROTATION_GLB),
        [NavigationType.PAN]: new NavigationGizmo(PAN_GLB),
        [NavigationType.ZOOM]: new NavigationGizmo(SCROLL_GLB, { sizeInPixels: 40 })
    };
    // Create a controller with varying options.
    const navigateController = new SceneNavigationControllerJoystick(gizmos, limitBounds, {
        navigationMode: NavigationKeysMode.TANGENT_FORWARD, // navigate along camera paths
        defaultSpeed: 1, // ~28km/h
        allowZoomOnClick: true, // clicking on a spot zooms in on to that location by a set fraction
        useZoomAnimations: false, // don't use smooth animations when zooming or out
        fasterMultiplier: 4, // go two times as fast when shift is pressed
        slowerMultiplier: 0.25, // go only half as fast when space is pressed
        swapPanRotateButtons: true
    });

    map.defaultController = new DefaultController({ navigateController });

    return navigateController.getJoystickPanSupport();
}

