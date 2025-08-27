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
import {loadHSPC, loadOGC3dTiles} from "./utils/HSPCLoader.ts";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import {loadLabels} from "./utils/LabelLoader.ts";
import {ViewToolIBar} from "../buttons/ViewToolIBar.tsx";

const defaultProjection = "LUCIAD:XYZ";

// Get reference from URL query params or default to EPSG:4978
const params = new URLSearchParams(window.location.search);
const referenceIdentifier = defaultProjection;

const hspcUrl = params.get("hspc") || null;
const ogc3dTilesUrl = params.get("3dtiles") || null;

const labelsUrl = params.get("labels") || null;
const reference = getReference(referenceIdentifier);

interface Props {
    onShowTime?: () => void;
}

export const LuciadMap: React.FC<Props> = (props: Props) => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<WebGLMap | null>(null);
    const activeLayer = useRef<TileSet3DLayer | null>(null);

    useEffect(() => {
        if (divRef.current) {
            mapRef.current = new WebGLMap(divRef.current, {reference});
            createAxes();

            if (hspcUrl) {
                loadHSPC(hspcUrl).then(layer => {
                    try {
                        //Add the model to the map
                        mapRef.current?.layerTree.addChild(layer);
                        // Zoom to the point cloud location
                        mapRef.current?.mapNavigator.fit({bounds: layer.bounds, animate: false});
                        activeLayer.current = layer;
                        if (labelsUrl) loadLabels(labelsUrl).then(labelsLayer => {
                            mapRef.current?.layerTree.addChild(labelsLayer);
                        })
                        if (typeof props.onShowTime === "function") props.onShowTime();
                    } catch (_e) {
                        if (mapRef.current && !layer.model.reference.equals(mapRef.current.reference)) {
                            console.log(`"Map and data are not in the same reference. Layer is in: ${layer.model.reference.identifier}`)
                        }
                    }
                });
            } else if (ogc3dTilesUrl) {
                loadOGC3dTiles(ogc3dTilesUrl).then(layer => {
                    try {
                        //Add the model to the map
                        mapRef.current?.layerTree.addChild(layer);
                        // Zoom to the point cloud location
                        mapRef.current?.mapNavigator.fit({bounds: layer.bounds, animate: false});
                        activeLayer.current = layer;
                        if (labelsUrl) loadLabels(labelsUrl).then(labelsLayer => {
                            mapRef.current?.layerTree.addChild(labelsLayer);
                        })
                        if (typeof props.onShowTime === "function") props.onShowTime();
                    } catch (_e) {
                        if (mapRef.current && !layer.model.reference.equals(mapRef.current.reference)) {
                            console.log(`"Map and data are not in the same reference. Layer is in: ${layer.model.reference.identifier}`)
                        }
                    }
                });
            }
        }
        return () => {
            if (mapRef.current) mapRef.current.destroy();
            mapRef.current = null;
        }
    }, []);

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
            <div className="LuciadMapElement" ref={divRef}></div>
            <ViewToolIBar mapRef={mapRef} layerRef={activeLayer}/>
        </div>
    )
}

