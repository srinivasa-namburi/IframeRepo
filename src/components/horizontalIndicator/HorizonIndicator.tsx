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

    // Pitch markings (10° steps)
    const pitchMarks = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);

    // Roll ring markings
    const rollMarks = [-90, -60, -30, -20, -10, 0, 10, 20, 30, 60, 90];
    const specialCircles = [-45, 45];

    const pitchToY = (p: number) => -(p / maxPitch) * radius;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
                <clipPath id="horizonClip">
                    <circle cx={radius} cy={radius} r={radius} />
                </clipPath>
            </defs>

            {/* Outer circle */}
            <circle cx={radius} cy={radius} r={radius} fill="#222" stroke="#333" strokeWidth={2} />

            {/* Horizon cylinder */}
            <g
                clipPath="url(#horizonClip)"
                transform={`translate(${radius},${radius}) rotate(${roll}) translate(${-radius},${-radius})`}
            >
                {/* Sky */}
                <rect x={0} y={0} width={size} height={size} fill="#4DA6FF" />
                {/* Ground */}
                <rect x={0} y={radius + pitchToY(clampedPitch)} width={size} height={size} fill="#6E4B3A" />
                {/* Horizon line */}
                <line
                    x1={0}
                    y1={radius + pitchToY(clampedPitch)}
                    x2={size}
                    y2={radius + pitchToY(clampedPitch)}
                    stroke="white"
                    strokeWidth={2}
                />
                {/* Pitch markings */}
                {pitchMarks.map((t) => (
                    <g key={t}>
                        {/* Upper (blue) */}
                        <line
                            x1={radius - 10}
                            x2={radius + 10}
                            y1={radius + pitchToY(clampedPitch + t)}
                            y2={radius + pitchToY(clampedPitch + t)}
                            stroke="white"
                            strokeWidth={1}
                        />
                        <text
                            x={radius + 14}
                            y={radius + pitchToY(clampedPitch + t) + 4}
                            fill="white"
                            fontSize={10}
                            fontFamily="monospace"
                        >
                            {t}
                        </text>

                        {/* Lower (brown) */}
                        <line
                            x1={radius - 10}
                            x2={radius + 10}
                            y1={radius + pitchToY(clampedPitch - t)}
                            y2={radius + pitchToY(clampedPitch - t)}
                            stroke="white"
                            strokeWidth={1}
                        />
                        <text
                            x={radius + 14}
                            y={radius + pitchToY(clampedPitch - t) + 4}
                            fill="white"
                            fontSize={10}
                            fontFamily="monospace"
                        >
                            {t}
                        </text>
                    </g>
                ))}
            </g>

            {/* Roll ring (rotates clockwise for positive roll) */}
            <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                {rollMarks.map((r) => {
                    const angleRad = (r * Math.PI) / 180;
                    const outerR = radius - 5;
                    const innerR = radius - 15;

                    const x1 = Math.sin(angleRad) * innerR;
                    const y1 = -Math.cos(angleRad) * innerR;
                    const x2 = Math.sin(angleRad) * outerR;
                    const y2 = -Math.cos(angleRad) * outerR;

                    return (
                        <line
                            key={r}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="yellow"
                            strokeWidth={1.5}
                        />
                    );
                })}

                {/* Special red circles at ±45° */}
                {specialCircles.map((r) => {
                    const angleRad = (r * Math.PI) / 180;
                    const ringRadius = radius - 10;
                    const cx = Math.sin(angleRad) * ringRadius;
                    const cy = -Math.cos(angleRad) * ringRadius;
                    return <circle key={r} cx={cx} cy={cy} r={4} fill="red" />;
                })}
            </g>

            {/* Pitch indicator (half-circle with wings) */}
            <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                <path d={`M -15,0 A 15,15 0 0,1 15,0`} fill="transparent" stroke="yellow" strokeWidth={2} />
                <line x1={-15} y1={0} x2={-25} y2={0} stroke="yellow" strokeWidth={2} />
                <line x1={15} y1={0} x2={25} y2={0} stroke="yellow" strokeWidth={2} />
            </g>
        </svg>
    );
};
