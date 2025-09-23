import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel.js";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import type {PointCloudStyle} from "@luciad/ria/view/style/PointCloudStyle.js";
import {ScalingMode} from "@luciad/ria/view/style/ScalingMode.js";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel.js";
import type {HttpRequestHeaders} from "@luciad/ria/util/HttpRequestOptions.js";
import {
    attribute,
    color, dotProduct,
    fraction,
    mixmap,
    numberParameter,
    positionAttribute
} from "@luciad/ria/util/expression/ExpressionFactory.js";
import {pointParameter} from "@luciad/ria/util/expression/ExpressionFactory.js";

export type StyleModeName =  "rgb" | "intensity" | "vertical";
export const INITIAL_POINTCLOUD_STYLE_MODE = "rgb";

const COLOR_SPAN_HEIGHT = [
    "rgba( 0 , 0 , 255, 0.9)",
    "rgba( 0 , 255 , 255, 0.9)",
    "rgba( 0 , 255 , 0, 0.9)",
    "rgba( 255 , 255 , 0, 0.9)",
    "rgba( 255 , 0 , 0, 0.9)"
    ]

const COLOR_SPAN_INTENSITY = [
    "#808080", // medium gray
    "#999999", // lighter
    "#B3B3B3", // even lighter
    "#CCCCCC", // very light
    "#E6E6E6"  // near white
];


const colorMix = COLOR_SPAN_INTENSITY.map(c => {
    return color(c);
});

const colorMixHeight = COLOR_SPAN_HEIGHT.map(c => {
    return color(c);
});


interface LoadingOptions {
    requestHeaders?: HttpRequestHeaders;
    credentials?: boolean
}

export function getRequestInitValues(params: URLSearchParams): RequestInit | null {
    const encoded = params.get("requestInit");
    if (!encoded) return {} as RequestInit;
    // Decode base64 safely
    const decoded = atob(encoded);
    return JSON.parse(decoded) as RequestInit;
}

export function loadHSPC(url: string, o: RequestInit | null) {
    const options = mapRequestInitToLoadingOptions(o);
    return new Promise<TileSet3DLayer>((resolve, reject) => {
        // Create the model
            HSPCTilesModel.create(url, options).then((model:HSPCTilesModel)=>{
                //Create a layer for the model
                const layer = new TileSet3DLayer(model, {
                    label: "HSPC Layer",
                });
                const style = createPointStyle({mode: INITIAL_POINTCLOUD_STYLE_MODE, layer});
                // Set the style
                layer.pointCloudStyle = style.pointCloudStyle;
                resolve(layer)
            }).catch(()=>{
                reject();
            });
    })
}

export function loadOGC3dTiles(url: string, o: RequestInit | null) {
    const options = mapRequestInitToLoadingOptions(o);
    return new Promise<TileSet3DLayer>((resolve, reject) => {
        // Create the model
        OGC3DTilesModel.create(url, options).then((model:OGC3DTilesModel)=>{
            //Create a layer for the model
            const layer = new TileSet3DLayer(model, {
                label: "OGC 3D Tiles Layer",
            });
            const style = createPointStyle({mode: INITIAL_POINTCLOUD_STYLE_MODE, layer});
            // Set the style
            layer.pointCloudStyle = style.pointCloudStyle;
            resolve(layer)
        }).catch(()=>{
            reject();
        });
    })
}

export function setPointStyleMode(layer: TileSet3DLayer, mode: StyleModeName) {
    const style = createPointStyle({mode, layer});
    // Set the style
    layer.pointCloudStyle["colorExpression"] = undefined;
    layer.pointCloudStyle = style.pointCloudStyle;
}

function mapRequestInitToLoadingOptions(r: RequestInit | null | undefined): LoadingOptions {
    if (!r) return {
        requestHeaders: {},
        credentials: false
    }
    const headers: HttpRequestHeaders | undefined = r.headers
        ? r.headers instanceof Headers
            ? Object.fromEntries(r.headers.entries())
            : Array.isArray(r.headers)
                ? Object.fromEntries(r.headers)
                : r.headers
        : undefined;

    const credentials = r.credentials === "include";

    return {
        requestHeaders: headers,
        credentials,
    };
}

//  Defines a style to style a PointCloud
function createPointStyle(options: {mode: StyleModeName, layer: TileSet3DLayer}): {
    pointCloudStyle: PointCloudStyle;
}  {
    const {layer, mode} = options;

    // Range (8 bits)
    const minParameter = numberParameter(0);
    const maxParameter = numberParameter(16384);
    const intensityFraction = fraction(attribute("Intensity"), minParameter!, maxParameter!);

    const minHeightParameter =  numberParameter(layer.bounds.z + layer.bounds.depth / 10);
    const maxHeightParameter =  numberParameter(layer.bounds.z + layer.bounds.depth - layer.bounds.depth / 10);

    // Uses absolute position of the point as value to evaluate in the expressions
    const position = positionAttribute();
    const zValue = dotProduct(position, pointParameter({x: 0, y: 0, z: 1}));
    const heightFraction = fraction(zValue, minHeightParameter, maxHeightParameter);

    const common: PointCloudStyle = {
        pointSize:{
            mode: ScalingMode.ADAPTIVE_WORLD_SIZE,
            minimumPixelSize: 2,
            worldScale: 1
        }
    }
    if (mode==="vertical") {
        return {
            pointCloudStyle: {
                ...common,
                colorExpression: mixmap(heightFraction, colorMixHeight)
            }
        }
    } else
    if (mode==="intensity") {
        return {
            pointCloudStyle: {
                ...common,
                colorExpression: mixmap(intensityFraction, colorMix)
            }
        }
    } else {
        return {
            pointCloudStyle: {
                ...common,
                colorExpression: undefined
            },
        }
    }

}
