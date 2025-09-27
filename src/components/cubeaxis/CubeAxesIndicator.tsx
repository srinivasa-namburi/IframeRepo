import React from "react";
import "./CubeAxesIndicator.css";

interface CubeAxesIndicatorProps {
    pitch: number;
    roll: number;
    yaw: number;
    size?: number;
    opacity?: number;
    axisScale?: number; // scale factor for axis length
}

export const CubeAxesIndicator: React.FC<CubeAxesIndicatorProps> = ({
                                                                        pitch,
                                                                        roll,
                                                                        yaw,
                                                                        size = 200,
                                                                        opacity = 1,
                                                                        axisScale = 1.2, // default axis scale
                                                                    }) => {
    const half = size / 2;
    const SOrigin = 1.1; // origin shift factor

    const shiftX = -SOrigin * half;
    const shiftY = SOrigin * half;
    const shiftZ = SOrigin * half;

    const cubeStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotateZ(${roll}deg) rotateX(${pitch}deg) rotateY(${yaw}deg)`,
        opacity,
        "--half": `${half}px`,
        "--axis-scale": `${half * 2 * axisScale}px`, // full cube face width × axisScale
    } as React.CSSProperties;

    const originTranslate = `translate3d(${shiftX}px, ${shiftY}px, ${shiftZ}px)`;

    return (
        <div className="cube-container" style={{ width: size, height: size }}>
            <div className="cube" style={cubeStyle}>
                {/* Cube faces */}
                <div className="face front">Front</div>
                <div className="face back">Back</div>
                <div className="face left">Left</div>
                <div className="face right">Right</div>
                <div className="face top">Top</div>
                <div className="face bottom">Bottom</div>

                {/* X-axis → right (+X) */}
                <div className="axis-wrapper" style={{ color: "red", transform: `${originTranslate} rotateY(0deg)` }}>
                    <div className="axis"></div>
                    <div className="axis second"></div>
                </div>

                {/* Y-axis → back (-Y) */}
                <div className="axis-wrapper" style={{ color: "green", transform: `${originTranslate} rotateY(90deg)` }}>
                    <div className="axis"></div>
                    <div className="axis second"></div>
                </div>

                {/* Z-axis → top (+Z) */}
                <div className="axis-wrapper" style={{ color: "blue", transform: `${originTranslate} rotateZ(-90deg)` }}>
                    <div className="axis"></div>
                    <div className="axis second"></div>
                </div>
            </div>
        </div>
    );
};
