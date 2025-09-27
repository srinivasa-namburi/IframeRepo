import React from "react";
import "./CubeAxesIndicator.css";

interface CemereAnglesProps {
    pitch: number; // degrees
    roll: number;  // degrees
    yaw: number;   // degrees
    size?: number; // default 200
    opacity?: number;
}

export const CubeAxesIndicator: React.FC<CemereAnglesProps> = ({
                                                                   pitch,
                                                                   roll,
                                                                   yaw,
                                                                   size = 200,
                                                                   opacity = 1,
                                                               }) => {
    const half = size / 2;

    const cubeStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        transform: `
    rotateZ(${roll}deg)
    rotateX(${pitch}deg)
    rotateY(${yaw}deg)
  `,
        opacity,
        "--half": `${half}px`,
        "--font-size": `${size * 0.20}px`, // bigger proportional font size
    } as React.CSSProperties;

    return (
        <div className="cube-container" style={{ width: size, height: size }}>
            <div className="cube" style={cubeStyle}>
                <div className="face front">Front</div>
                <div className="face back">Back</div>
                <div className="face left">Left</div>
                <div className="face right">Right</div>
                <div className="face top">Top</div>
                <div className="face bottom">Bottom</div>

                <div className="axis x-axis">X</div>
                <div className="axis y-axis">Y</div>
                <div className="axis z-axis">Z</div>
            </div>
        </div>
    );
};
