import {FeaturePainter, type PaintState} from "@luciad/ria/view/feature/FeaturePainter.js";
import type {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas.js";
import {Feature} from "@luciad/ria/model/feature/Feature.js";
import {Shape} from "@luciad/ria/shape/Shape.js";
import {Layer} from "@luciad/ria/view/Layer.js";
import {Map} from "@luciad/ria/view/Map.js";
import {PointLabelPosition} from "@luciad/ria/view/style/PointLabelPosition.js";
import {Point} from "@luciad/ria/shape/Point.js";
import type {LabelCanvas} from "@luciad/ria/view/style/LabelCanvas.js";
import type {Icon3DStyle} from "@luciad/ria/view/style/Icon3DStyle.js";
import {create3DCylinder} from "./meshes/simple3DMeshes/Simple3DMeshFactory.ts";
import {DrapeTarget} from "@luciad/ria/view/style/DrapeTarget.js";
import type {IconStyle} from "@luciad/ria/view/style/IconStyle.js";

import * as IconFactory from "./icons/IconFactory.ts"
import {OcclusionMode} from "@luciad/ria/view/style/OcclusionMode.js";

const InvisibleIconStyle:  IconStyle = {
    drapeTarget: DrapeTarget.NOT_DRAPED,
    image: IconFactory.createCircle({
        width: 16,
        height: 16,
        stroke: "rgba(255,255,255,0.0)",
        fill: "rgba(255,255,255,0.0)",
    }),
    occlusionMode: OcclusionMode.ALWAYS_VISIBLE,
    opacity: 0,
    width: "32px",
    height: "32px"
}

// const LabelColor = "#00ffff";
const LabelColor = "#e5dcea";
const labelCssStyleRobot =`"
      display: inline-block;
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
      font-size: 14px;
      color: ${LabelColor}; /* neon cyan */
      text-shadow: 
        0 0 2px ${LabelColor},
        0 0 5px ${LabelColor},
        0 0 10px ${LabelColor},
        0 0 15px ${LabelColor};
      background-color: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border: 1px solid ${LabelColor};
      border-radius: 4px;
      box-shadow: 0 0 6px ${LabelColor};
      text-align: center;
      pointer-events: none;
      white-space: nowrap;
    "`

const Scale = 0.8;

const IconStyle = (diameter: number): Icon3DStyle => ({
    mesh: create3DCylinder(Scale * diameter / 2, 0.10, 20),
   color: "rgba(255, 103, 0, 0.75)", // semi-transparent red  ff80ab
   // color: "rgba(255, 255, 255, 0.75)", // semi-transparent red  ff80ab
    legacyAxis: false,
});

export class PointCloudLabelPainter extends FeaturePainter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paintBody(geoCanvas: GeoCanvas, _feature: Feature, shape: Shape, _layer: Layer, _map: Map, _paintState: PaintState) {
        //  const style: ShapeStyle = _paintState.selected ? SelectedStyle : DefaultStyle;
        if (shape instanceof Point) {
            geoCanvas.drawIcon(shape, InvisibleIconStyle);
            geoCanvas.drawIcon3D(shape, IconStyle(_feature.properties.diameter));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, _layer: Layer, _map: Map, _paintState: PaintState) {
        const html = `<div style=${labelCssStyleRobot}>${feature.properties.diameter.toFixed(2)}</div>`;


        if (shape instanceof Point) {
            labelCanvas.drawLabel(html, shape, {
               // pin: {width: 2, color: "#00ffff", haloColor: "#00ffff"},
               // offset: [15, 5],
               positions: [PointLabelPosition.NORTH_WEST, PointLabelPosition.NORTH_EAST, PointLabelPosition.SOUTH_WEST, PointLabelPosition.SOUTH_EAST]
              //  positions: [PointLabelPosition.NORTH]
            });
        }
    }

}
