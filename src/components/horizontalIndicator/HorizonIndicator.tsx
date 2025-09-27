import React from "react";

interface HorizonIndicatorProps {
    pitch: number; // degrees, positive = nose up
    roll: number;  // degrees, positive = right wing down
    size: number;
}

export const HorizonIndicator: React.FC<HorizonIndicatorProps> = ({ pitch, roll, size }) => {
    const radius = size / 2;
    const maxPitch = 90;
    const R = 15; // half-circle radius for pitch indicator
    const clampedPitch = Math.max(Math.min(pitch, maxPitch), -maxPitch);

    // Roll ring width proportional to size
    const ringWidth = size * 0.05; // 10% of total size
    const ringOuterRadius = radius - 2;
    const ringInnerRadius = ringOuterRadius - ringWidth;

    // Pitch markings (10° steps, doubled spacing)
    const pitchMarks = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);

    // Roll ring markings
    const rollMarks = [-90, -60, -30, -20, -10, 0, 10, 20, 30, 60, 90];
    const specialCircles = [-45, 45];

    // Scale pitch to Y coordinate
    const pitchToY = (p: number) => -(p / maxPitch) * radius * 2; // double spacing

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
                <clipPath id="horizonClip">
                    <circle cx={radius} cy={radius} r={radius} />
                </clipPath>
            </defs>

            {/* Outer circle */}
            <circle cx={radius} cy={radius} r={radius} fill="#222" stroke="#333" strokeWidth={2} />

            {/* Horizon cylinder (behind roll ring) */}
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
                        {/* Upper */}
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

                        {/* Lower */}
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

            {/* Roll ring (thick) */}
            <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                {/* Ring background */}
                <circle
                    cx={0}
                    cy={0}
                    r={(ringInnerRadius + ringOuterRadius) / 2}
                    fill="none"
                    stroke="black"
                    strokeWidth={ringWidth}
                />
                {/* Ring border (outer) */}
                <circle
                    cx={0}
                    cy={0}
                    r={ringOuterRadius}
                    fill="none"
                    stroke="yellow"
                    strokeWidth={2}
                />
                {/* Ring border (inner) */}
                <circle
                    cx={0}
                    cy={0}
                    r={ringInnerRadius}
                    fill="none"
                    stroke="yellow"
                    strokeWidth={2}
                />

                {/* Roll ticks */}
                {rollMarks.map((r) => {
                    const angleRad = (r * Math.PI) / 180;
                    const x1 = Math.sin(angleRad) * ringInnerRadius;
                    const y1 = -Math.cos(angleRad) * ringInnerRadius;
                    const x2 = Math.sin(angleRad) * ringOuterRadius;
                    const y2 = -Math.cos(angleRad) * ringOuterRadius;

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
                    const ringRadius = (ringInnerRadius + ringOuterRadius) / 2;
                    const cx = Math.sin(angleRad) * ringRadius;
                    const cy = -Math.cos(angleRad) * ringRadius;
                    const specialCircleRadius = Math.min(4, ringWidth * 0.4); // scale with ring
                    return <circle key={r} cx={cx} cy={cy} r={specialCircleRadius} fill="red" />;
                })}
            </g>

            {/* Roll indicator triangle on top of ring, pointing down */}
            <polygon
                points={`
      ${radius},${radius - ringOuterRadius + ringWidth * 0.5} 
      ${radius - ringWidth / 3},${radius - ringOuterRadius} 
      ${radius + ringWidth / 3},${radius - ringOuterRadius}
    `}
                fill="yellow"
            />


            {/* Pitch indicator */}
            <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                {/* Top half-circle */}
                <path
                    d={`M -${R},0 A ${R},${R} 0 0,0 ${R},0`}
                    fill="transparent"
                    stroke="yellow"
                    strokeWidth={3}
                />
                {/* Wings */}
                <line x1={-R} y1={0} x2={-60} y2={0} stroke="yellow" strokeWidth={3} />
                <line x1={R} y1={0} x2={60} y2={0} stroke="yellow" strokeWidth={3} />
            </g>
        </svg>
    );
};
