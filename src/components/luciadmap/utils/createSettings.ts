import {WebGLMap} from "@luciad/ria/view/WebGLMap.js";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer.js";
import {MemoryStore} from "@luciad/ria/model/store/MemoryStore.js";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel.js";
import {AxisPainter} from "./AxisPainter.ts";
import {createBounds, createPolyline} from "@luciad/ria/shape/ShapeFactory.js";
import {Feature} from "@luciad/ria/model/feature/Feature.js";
import {createEquirectangularImagery} from "@luciad/ria/view/EnvironmentMapEffect.js";

export const createAxes = (map: WebGLMap | null) => {
    if (!map) return;
    const reference =  map.reference;
    let layer = map.layerTree.findLayerById("axis") as FeatureLayer;
    if (layer) return;

    const store = new MemoryStore({reference});
    const model = new FeatureModel(store, {reference});
    const painter = new AxisPainter();
    layer = new FeatureLayer(model, {id: "axis", visible: false, editable: false, selectable: false, painter});
    map.layerTree.addChild(layer);

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

export const createEffects = (map: WebGLMap | null) => {
    if (!map) return;
    map.effects.eyeDomeLighting = {
        window: 2,
        strength: 0.1,
        color: "rgb(223,223,223)"
    }
}

export const createSky = (map: WebGLMap | null, colorId: string) => {
    if (!map) return;

    if (colorId === "$sky") {
        map.effects.environmentMap = {
            skybox: {
                imagery: createEquirectangularImagery("./background/skybox_blue.jpg")
            },
        };
    } else {
        map.effects.environmentMap = {
            skybox: null
        };
    }
}
