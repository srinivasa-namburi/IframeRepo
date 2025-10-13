import React from "react";
import "./CubeAxesIndicator.css";

interface CubeAxesIndicatorProps {
    pitch: number;
    roll: number;
    yaw: number;
    size?: number;
    opacity?: number;
}

interface AxisProps {
    color: string;
    rotation: string;
    label: string;
    length: number;
}

const Axis: React.FC<AxisProps> = ({ color, rotation, label, length }) => {
    return (
        <div
            className="axis-wrapper"
            style={{ color, transform: rotation }}
        >
            <div className="axis" style={{ width: length }} />
            <div className="axis second" style={{ width: length }} />
            <div className="axis-end" style={{ backgroundColor: color }}>
                {label}
            </div>
        </div>
    );
};

export const CubeAxesIndicator: React.FC<CubeAxesIndicatorProps> = ({
                                                                        pitch,
                                                                        roll,
                                                                        yaw,
                                                                        size = 200,
                                                                        opacity = 1,
                                                                    }) => {
    const half = size / 2;
    const axisLength = half * 2.2; // slightly longer than cube
    const originShift = 1.1 * half;

    const cubeStyle: React.CSSProperties = {
        pointerEvents: "none",
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotateZ(${roll}deg) rotateX(${pitch}deg) rotateY(${yaw}deg)`,
        opacity,
        "--half": `${half}px`,
        "--axis-scale": `${axisLength}px`,
    } as React.CSSProperties;

    const originTranslate = `translate3d(${-originShift}px, ${originShift}px, ${originShift}px)`;

    return (
        <div className="cube-container" style={{ width: size, height: size, display: "inline" }}>
            <div className="cube" style={cubeStyle}>
                {/* Cube faces */}
                <div className="face front">Front</div>
                <div className="face back">Back</div>
                <div className="face left">Left</div>
                <div className="face right">Right</div>
                <div className="face top">Top</div>
                <div className="face bottom">Bottom</div>

                {/* Axes */}
                <Axis
                    color="red"
                    rotation={`${originTranslate} rotateY(0deg)`} // X → right
                    label="X"
                    length={axisLength}
                />
                <Axis
                    color="green"
                    rotation={`${originTranslate} rotateX(-90deg) rotateZ(90deg)`} // Y → back
                    label="Y"
                    length={axisLength}
                />
                <Axis
                    color="blue"
                    rotation={`${originTranslate} rotateZ(-90deg)`} // Z → up
                    label="Z"
                    length={axisLength}
                />
            </div>
        </div>
    );
};
