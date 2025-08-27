import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel.js";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import type {PointCloudStyle} from "@luciad/ria/view/style/PointCloudStyle.js";
import {ScalingMode} from "@luciad/ria/view/style/ScalingMode.js";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel.js";

export function loadHSPC(url: string) {
    return new Promise<TileSet3DLayer>((resolve, reject) => {
        const style = createPointStyle();
        // Create the model
        try {
            HSPCTilesModel.create(url, {}).then((model:HSPCTilesModel)=>{
                //Create a layer for the model
                const layer = new TileSet3DLayer(model, {
                    label: "HSPC Layer",
                });

                // Set the style
                layer.pointCloudStyle = style.pointCloudStyle;
                resolve(layer)
            });
        } catch (_err) {
            reject();
        }
    })
}

export function loadOGC3dTiles(url: string) {
    return new Promise<TileSet3DLayer>((resolve, reject) => {
        const style = createPointStyle();
        // Create the model
        try {
            OGC3DTilesModel.create(url, {}).then((model:OGC3DTilesModel)=>{
                //Create a layer for the model
                const layer = new TileSet3DLayer(model, {
                    label: "OGC 3D Tiles Layer",
                });

                // Set the style
                layer.pointCloudStyle = style.pointCloudStyle;
                resolve(layer)
            });
        } catch (_err) {
            reject();
        }
    })
}

//  Defines a style to style a PointCloud
function createPointStyle(): {
    pointCloudStyle: PointCloudStyle;
}  {
    return {
        pointCloudStyle: {
            //  gapFill: 3,   // Too heavy style for Intel Integrated Graphic cards
            pointSize: {
                mode: ScalingMode.ADAPTIVE_WORLD_SIZE,
                minimumPixelSize: 2,
                worldScale: 1
            },
        },
    }
}
