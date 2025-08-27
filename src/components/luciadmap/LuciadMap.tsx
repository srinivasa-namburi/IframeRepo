import * as React from "react";

import "./LuciadMap.scss"
import {useEffect, useRef} from "react";
import {WebGLMap} from "@luciad/ria/view/WebGLMap.js";
import {getReference} from "@luciad/ria/reference/ReferenceProvider.js";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer.js";
import {MemoryStore} from "@luciad/ria/model/store/MemoryStore.js";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel.js";
import {createBounds, createPolyline} from "@luciad/ria/shape/ShapeFactory.js";
import {Feature} from "@luciad/ria/model/feature/Feature.js";
import {AxisPainter} from "./utils/AxisPainter.ts";
import {getRequestInitValues, loadHSPC, loadOGC3dTiles} from "./utils/HSPCLoader.ts";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import {loadLabels} from "./utils/LabelLoader.ts";
import {ViewToolIBar} from "../buttons/ViewToolIBar.tsx";
import {ColorPicker} from "../colorpicker/ColorPicker.tsx";

const defaultProjection = "LUCIAD:XYZ";


// Get reference from URL query params or default to EPSG:4978
const params = new URLSearchParams(window.location.search);
const referenceIdentifier = defaultProjection;

const hspcUrl = params.get("hspc") || null;
const ogc3dTilesUrl = params.get("3dtiles") || null;

const labelsUrl = params.get("labels") || null;
const requestInit = getRequestInitValues(params);

const reference = getReference(referenceIdentifier);

const AvailableBackgroundColors = [
    "#000000", "#1a1a2e", "#003366", "#2e2e3e", "#4d4d5e"
];

const LOCAL_STORAGE_BG_KEY = "point-cloud-viewer-background";


interface Props {
    onShowTime?: (status: boolean) => void;
}




export const LuciadMap: React.FC<Props> = (props: Props) => {
    const storedColor = localStorage.getItem(LOCAL_STORAGE_BG_KEY);

    const [bgColor, setBgColor] = React.useState<string>(storedColor || AvailableBackgroundColors[3]);

    const divRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<WebGLMap | null>(null);
    const activeLayer = useRef<TileSet3DLayer | null>(null);

    useEffect(() => {
        if (divRef.current) {
            mapRef.current = new WebGLMap(divRef.current, {reference});
            createAxes();

            if (hspcUrl) {
                loadHSPC(hspcUrl, requestInit).then(layer => {
                    try {
                        //Add the model to the map
                        mapRef.current?.layerTree.addChild(layer);
                        // Zoom to the point cloud location
                        mapRef.current?.mapNavigator.fit({bounds: layer.bounds, animate: false});
                        activeLayer.current = layer;
                        if (labelsUrl) loadLabels(labelsUrl, requestInit).then(labelsLayer => {
                            mapRef.current?.layerTree.addChild(labelsLayer);
                        }).catch(()=>{
                            if (typeof props.onShowTime === "function") props.onShowTime(false);
                        })
                        if (typeof props.onShowTime === "function") props.onShowTime(true);
                    } catch (_e) {
                        if (typeof props.onShowTime === "function") props.onShowTime(false);
                        if (mapRef.current && !layer.model.reference.equals(mapRef.current.reference)) {
                            console.log(`"Map and data are not in the same reference. Layer is in: ${layer.model.reference.identifier}`)
                        }
                    }
                }).catch(()=>{
                    if (typeof props.onShowTime === "function") props.onShowTime(false);
                    console.log(`Data unreachable`)
                });
            } else if (ogc3dTilesUrl) {
                loadOGC3dTiles(ogc3dTilesUrl, requestInit).then(layer => {
                    try {
                        //Add the model to the map
                        mapRef.current?.layerTree.addChild(layer);
                        // Zoom to the point cloud location
                        mapRef.current?.mapNavigator.fit({bounds: layer.bounds, animate: false});
                        activeLayer.current = layer;
                        if (labelsUrl) loadLabels(labelsUrl, requestInit).then(labelsLayer => {
                            mapRef.current?.layerTree.addChild(labelsLayer);
                        })
                        if (typeof props.onShowTime === "function") props.onShowTime(true);
                    } catch (_e) {
                        if (mapRef.current && !layer.model.reference.equals(mapRef.current.reference)) {
                            console.log(`"Map and data are not in the same reference. Layer is in: ${layer.model.reference.identifier}`)
                        }
                    }
                }).catch(()=>{
                    if (typeof props.onShowTime === "function") props.onShowTime(false);
                    console.log(`Data unreachable`)
                });
            }
        }
        return () => {
            if (mapRef.current) mapRef.current.destroy();
            mapRef.current = null;
        }
    }, []);

    // Update localStorage whenever the user changes the color
    const handleColorChange = (color: string) => {
        setBgColor(color);
        localStorage.setItem(LOCAL_STORAGE_BG_KEY, color);
    };

    const createAxes = () => {
        if (!mapRef.current) return;
        let layer = mapRef.current.layerTree.findLayerById("axis") as FeatureLayer;
        if (layer) return;

        const store = new MemoryStore({reference});
        const model = new FeatureModel(store, {reference});
        const painter = new AxisPainter();
        layer = new FeatureLayer(model, {id: "axis", visible: false, editable: false, selectable: false, painter});
        mapRef.current.layerTree.addChild(layer);

        const targetModel = layer.model;

        const axes = [
            {axis: "x", from: [-100, 0, 0], to: [100, 0, 0], id: "x"},
            {axis: "y", from: [0, -100, 0], to: [0, 100, 0], id: "y"},
            {axis: "z", from: [0, 0, -100], to: [0, 0, 100], id: "z"}
        ];

        for (const {axis, from, to, id} of axes) {
            const line = createPolyline(reference, [from as never, to as never]);
            const feature = new Feature(line, {axis}, id);
            targetModel.add(feature);
        }

        const plane = createBounds(reference, [-100, 200, -100, 200, 0, 0]);
        const featurePlane = new Feature(plane, {axis: "x"}, "plane-x");
        targetModel.add(featurePlane);
    }

    return (
        <div className="LuciadMap">
            <div className="LuciadMapElement" ref={divRef} style={{backgroundColor: bgColor}}></div>
            <div style={{ position: "fixed", top: 16, left: 16, zIndex: 1000 }}>
                <ColorPicker colors={AvailableBackgroundColors} currentColor={bgColor} onChange={handleColorChange} />
            </div>
            <ViewToolIBar mapRef={mapRef} layerRef={activeLayer}/>
        </div>
    )
}


