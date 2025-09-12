import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel.js";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import type {PointCloudStyle} from "@luciad/ria/view/style/PointCloudStyle.js";
import {ScalingMode} from "@luciad/ria/view/style/ScalingMode.js";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel.js";
import type {HttpRequestHeaders} from "@luciad/ria/util/HttpRequestOptions.js";
import {attribute, color, fraction, mixmap, numberParameter} from "@luciad/ria/util/expression/ExpressionFactory.js";

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
        const style = createPointStyle();
        // Create the model
            HSPCTilesModel.create(url, options).then((model:HSPCTilesModel)=>{
                //Create a layer for the model
                const layer = new TileSet3DLayer(model, {
                    label: "HSPC Layer",
                });

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
        const style = createPointStyle();
        // Create the model
        OGC3DTilesModel.create(url, options).then((model:OGC3DTilesModel)=>{
            //Create a layer for the model
            const layer = new TileSet3DLayer(model, {
                label: "OGC 3D Tiles Layer",
            });

            // Set the style
            layer.pointCloudStyle = style.pointCloudStyle;
            resolve(layer)
        }).catch(()=>{
            reject();
        });
    })
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
function createPointStyle(mode?: "rgb" | "intensity"): {
    pointCloudStyle: PointCloudStyle;
}  {
    // Range (8 bits)
    const minParameter = numberParameter(0);
    const maxParameter = numberParameter(16384);
    const intensityFraction = fraction(attribute("Intensity"), minParameter!, maxParameter!);

    const common: PointCloudStyle = {
        pointSize:{
            mode: ScalingMode.ADAPTIVE_WORLD_SIZE,
            minimumPixelSize: 2,
            worldScale: 1
        }
    }
    if (mode==="intensity") {
        return {
            pointCloudStyle: {
                ...common,
                colorExpression: mixmap(intensityFraction, colorMix)
            }
        }
    } else {
        return {
            pointCloudStyle: {...common}
        }
    }

}
