import React from "react";

interface HorizonIndicatorProps {
    pitch: number; // degrees, positive = nose up
    roll: number;  // degrees, positive = right wing down
    size: number;
}

export const HorizonIndicator: React.FC<HorizonIndicatorProps> = ({ pitch, roll, size }) => {
    const radius = size / 2;
    const maxPitch = 90;
    const clampedPitch = Math.max(Math.min(pitch, maxPitch), -maxPitch);

    // Pitch markings every 10°
    const pitchTicks = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

    // Roll markings
    const rollTicks = [0, 10, 20, 30, 60, 90];

    // Map pitch to vertical offset
    const pitchToY = (p: number) => (-p / maxPitch) * radius;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
                <clipPath id="circleClip">
                    <circle cx={radius} cy={radius} r={radius} />
                </clipPath>
            </defs>

            {/* Outer circle */}
            <circle cx={radius} cy={radius} r={radius} fill="#222" stroke="#333" strokeWidth={2} />

            {/* Horizon Cylinder */}
            <g
                clipPath="url(#circleClip)"
                transform={`translate(${radius},${radius}) rotate(${roll}) translate(${-radius},${-radius})`}
            >
                {/* Sky */}
                <rect x={0} y={0} width={size} height={size} fill="#4DA6FF" />
                {/* Ground */}
                <rect
                    x={0}
                    y={radius + pitchToY(clampedPitch)}
                    width={size}
                    height={size / 2 + radius} // ensure full brown coverage
                    fill="#6E4B3A"
                />
                {/* Horizon line */}
                <line
                    x1={0}
                    y1={radius + pitchToY(clampedPitch)}
                    x2={size}
                    y2={radius + pitchToY(clampedPitch)}
                    stroke="#FFF"
                    strokeWidth={2}
                />
                {/* Pitch markings */}
                {pitchTicks.map((t) =>
                    [1, -1].map((dir) => {
                        const y = radius + pitchToY(clampedPitch - dir * t);
                        return (
                            <g key={`pitch-${t}-${dir}`}>
                                <line x1={radius - 10} x2={radius + 10} y1={y} y2={y} stroke="white" strokeWidth={1.5} />
                                <text x={radius + 14} y={y + 4} fill="white" fontSize={10} fontFamily="monospace">
                                    {t}
                                </text>
                            </g>
                        );
                    })
                )}
            </g>

            {/* Fixed pitch indicator (half-circle with wings) */}
            <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                <path
                    d={`M -20 0 A 20 20 0 0 1 20 0`}
                    fill="transparent"
                    stroke="yellow"
                    strokeWidth={2}
                />
                <line x1={-20} y1={0} x2={-30} y2={0} stroke="yellow" strokeWidth={2} />
                <line x1={20} y1={0} x2={30} y2={0} stroke="yellow" strokeWidth={2} />
            </g>

            {/* Roll ring */}
            <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                {rollTicks.map((t) => {
                    const angle = (t * Math.PI) / 180;
                    const x = Math.sin(angle) * (radius - 12);
                    const y = -Math.cos(angle) * (radius - 12);
                    return (
                        <g key={`roll-${t}`}>
                            <line x1={x} y1={y} x2={x * 0.85} y2={y * 0.85} stroke="white" strokeWidth={1.5} />
                            <line x1={-x} y1={y} x2={-x * 0.85} y2={y * 0.85} stroke="white" strokeWidth={1.5} />
                            <text
                                x={x * 0.7}
                                y={y * 0.7 + 4}
                                fill="white"
                                fontSize={8}
                                fontFamily="monospace"
                                textAnchor={x < 0 ? "end" : "start"}
                            >
                                {t}
                            </text>
                            <text
                                x={-x * 0.7}
                                y={y * 0.7 + 4}
                                fill="white"
                                fontSize={8}
                                fontFamily="monospace"
                                textAnchor={-x < 0 ? "end" : "start"}
                            >
                                {t}
                            </text>
                        </g>
                    );
                })}
            </g>
        </svg>
    );
};
