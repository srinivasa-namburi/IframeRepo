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

// @ts-ignore
const labelCssStyle =`"
    display: inline-block;
    color: #ffffff;
    font-weight: bold;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    line-height: 1.2;
    padding: 3px 6px;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    box-shadow: 0 0 4px rgba(0,0,0,0.6);
    pointer-events: none;
  "`;

const labelStyleCssRobocop = `"
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 14px; /* slightly larger for readability */
  color: #00ffff; /* neon cyan */
  text-shadow:
    0 0 3px #00ffff,
    0 0 6px #00ffff,
    0 0 12px #66ffff,
    0 0 20px rgba(102,255,255,0.5);
  background-color: rgba(0,0,0,0.45); /* darker overlay */
  padding: 4px 8px; /* more breathing space */
  border: 1px solid #00ffff;
  border-radius: 4px;
  box-shadow: 0 0 6px #00ffff;
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
    "`

// @ts-ignore
const labelStyleCssTerminator = `"
  display: inline-block;
  font-family: 'OCR A Std', monospace;
  font-weight: bold;
  font-size: 14px;
  color: #ff0000; /* classic Terminator red */
  text-shadow:
    0 0 3px #ff0000,
    0 0 6px #ff0000,
    0 0 12px #ff4c4c,
    0 0 20px rgba(255,76,76,0.5);
  background-color: rgba(0,0,0,0.5); /* darker overlay for readability */
  padding: 3px 8px; /* slightly larger */
  border: 1px solid #ff4c4c;
  border-radius: 3px;
  box-shadow: 0 0 6px #ff0000;
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
    "`

const labelCssStyleRobot =`"
      display: inline-block;
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
      font-size: 14px;
      color: #00ffff; /* neon cyan */
      text-shadow: 
        0 0 2px #00ffff,
        0 0 5px #00ffff,
        0 0 10px #00ffff,
        0 0 15px #00ffff;
      background-color: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border: 1px solid #00ffff;
      border-radius: 4px;
      box-shadow: 0 0 6px #00ffff;
      text-align: center;
      pointer-events: none;
      white-space: nowrap;
    "`

// const DefaultStyle: ShapeStyle = {
//     fill: { color: "#" }, // vivid pink (contrasts green foliage)
//     stroke: { color: "#d500f9", width: 2 }, // strong purple outline
// };
//
// const SelectedStyle: ShapeStyle = {
//     fill: { color: "#40c4ff" }, // bright cyan (super visible against grass)
//     stroke: { color: "#ff6f00", width: 3 }, // bold orange accent
// };

const IconStyle = (diameter: number): Icon3DStyle => ({
    mesh: create3DCylinder(diameter / 2 / 5, 20, 20),
    color: "rgba(255, 103, 0, 0.75)", // semi-transparent red  ff80ab
    legacyAxis: false,
});

export class PointCloudLabelPainter extends FeaturePainter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paintBody(geoCanvas: GeoCanvas, _feature: Feature, shape: Shape, _layer: Layer, _map: Map, _paintState: PaintState) {
        //  const style: ShapeStyle = _paintState.selected ? SelectedStyle : DefaultStyle;
        if (shape instanceof Point) {
            // geoCanvas.drawShape(shape, style);
            geoCanvas.drawIcon3D(shape, IconStyle(_feature.properties.diameter));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, _layer: Layer, _map: Map, _paintState: PaintState) {
        const html = `<div style=${labelStyleCssRobocop}>${feature.properties.diameter.toFixed(2)}</div>`;


        if (shape instanceof Point) {
            labelCanvas.drawLabel(html, shape, {
                pin: {width: 2, color: "#00ffff", haloColor: "#00ffff"},
                offset: [15, 5],
                positions: [PointLabelPosition.NORTH_WEST, PointLabelPosition.NORTH_EAST, PointLabelPosition.SOUTH_WEST, PointLabelPosition.SOUTH_EAST]
            });
        }


    }


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paintLabelV2(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, _layer: Layer, _map: Map, _paintState: PaintState) {
        const html = `<div style=${labelCssStyleRobot}>${feature.properties.diameter.toFixed(2)}</div>`;


        // if (shape instanceof Point) {
        //     labelCanvas.drawLabel(html, shape, {
        //         pin: {width: 1, color: "white"},
        //         offset: [15, 5],
        //         positions: [PointLabelPosition.NORTH_WEST, PointLabelPosition.NORTH_EAST, PointLabelPosition.SOUTH_WEST, PointLabelPosition.SOUTH_EAST]
        //     });
        // }

        if (shape instanceof Point) {
            labelCanvas.drawLabel(html, shape, {
                offset: [15, 5],
            });
        }
    }


}
