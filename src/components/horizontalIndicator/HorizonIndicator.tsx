import React from "react";

interface HorizonIndicatorProps {
    pitch: number; // degrees, positive = nose up
    roll: number;  // degrees, positive = right wing down
    size?: number; // optional, default 100
    opacity?: number; // optional, default 1
}

export const HorizonIndicator: React.FC<HorizonIndicatorProps> = ({
                                                                      pitch,
                                                                      roll,
                                                                      size = 100,
                                                                      opacity = 1,
                                                                  }) => {
    const radius = size / 2;
    const maxPitch = 90;

    // Roll ring width proportional to size
    const ringWidth = size * 0.05; // 5% of size
    const ringOuterRadius = radius - 2;
    const ringInnerRadius = ringOuterRadius - ringWidth;

    // Half-circle pitch indicator radius proportional to ring
    const pitchR = ringInnerRadius * 0.25;
    const wingLength = ringInnerRadius * 0.7;
    const wingWidth = size * 0.03;

    // Pitch markings (10° steps)
    const pitchMarks = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);

    // Roll ring markings
    const rollMarks = [-90, -60, -30, -20, -10, 0, 10, 20, 30, 60, 90];
    const specialCircles = [-45, 45];

    // Convert pitch degrees to Y offset
    const pitchToY = (p: number) => (p / maxPitch) * radius * 2; // double spacing

    // Horizon Y coordinate
    const horizonY = radius + pitchToY(pitch);
    const clampedHorizonY = Math.min(Math.max(horizonY, 0), size);

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
            }}
        >
            <defs>
                <clipPath id="horizonClip">
                    <circle cx={radius} cy={radius} r={radius} />
                </clipPath>
            </defs>

            <g opacity={opacity}>
                {/* Outer circle */}
                <circle
                    cx={radius}
                    cy={radius}
                    r={radius}
                    fill="#222"
                    stroke="#333"
                    strokeWidth={2}
                />

                {/* Horizon cylinder */}
                <g
                    clipPath="url(#horizonClip)"
                    transform={`translate(${radius},${radius}) rotate(${roll}) translate(${-radius},${-radius})`}
                >
                    {/* Sky above horizon */}
                    <rect x={0} y={0} width={size} height={clampedHorizonY} fill="#4DA6FF" />
                    {/* Ground below horizon */}
                    <rect
                        x={0}
                        y={clampedHorizonY}
                        width={size}
                        height={size - clampedHorizonY}
                        fill="#6E4B3A"
                    />
                    {/* Horizon line */}
                    <line
                        x1={0}
                        y1={clampedHorizonY}
                        x2={size}
                        y2={clampedHorizonY}
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
                                y1={radius + pitchToY(pitch + t)}
                                y2={radius + pitchToY(pitch + t)}
                                stroke="white"
                                strokeWidth={1}
                            />
                            <text
                                x={radius + 14}
                                y={radius + pitchToY(pitch + t) + 4}
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
                                y1={radius + pitchToY(pitch - t)}
                                y2={radius + pitchToY(pitch - t)}
                                stroke="white"
                                strokeWidth={1}
                            />
                            <text
                                x={radius + 14}
                                y={radius + pitchToY(pitch - t) + 4}
                                fill="white"
                                fontSize={10}
                                fontFamily="monospace"
                            >
                                {t}
                            </text>
                        </g>
                    ))}
                </g>

                {/* Roll ring */}
                <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                    {/* Top half */}
                    <path
                        d={`
              M ${-ringOuterRadius},0
              A ${ringOuterRadius} ${ringOuterRadius} 0 0 1 ${ringOuterRadius},0
              L ${ringInnerRadius} 0
              A ${ringInnerRadius} ${ringInnerRadius} 0 0 0 ${-ringInnerRadius},0
              Z
            `}
                        fill="#4DA6FF"
                    />
                    {/* Bottom half */}
                    <path
                        d={`
              M ${-ringOuterRadius},0
              A ${ringOuterRadius} ${ringOuterRadius} 0 0 0 ${ringOuterRadius},0
              L ${ringInnerRadius} 0
              A ${ringInnerRadius} ${ringInnerRadius} 0 0 1 ${-ringInnerRadius},0
              Z
            `}
                        fill="#6E4B3A"
                    />

                    {/* Borders */}
                    <circle
                        cx={0}
                        cy={0}
                        r={ringOuterRadius}
                        fill="none"
                        stroke="yellow"
                        strokeWidth={2}
                    />
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

                    {/* Special ±45° red circles */}
                    {specialCircles.map((r) => {
                        const angleRad = (r * Math.PI) / 180;
                        const ringRadius = (ringInnerRadius + ringOuterRadius) / 2;
                        const cx = Math.sin(angleRad) * ringRadius;
                        const cy = -Math.cos(angleRad) * ringRadius;
                        const specialCircleRadius = Math.min(4, ringWidth * 0.4);
                        return <circle key={r} cx={cx} cy={cy} r={specialCircleRadius} fill="red" />;
                    })}
                </g>

                {/* Roll indicator triangle */}
                <polygon
                    points={`
            ${radius},${radius - ringOuterRadius + ringWidth * 0.5}
            ${radius - ringWidth / 3},${radius - ringOuterRadius}
            ${radius + ringWidth / 3},${radius - ringOuterRadius}
          `}
                    fill="yellow"
                />

                {/* Pitch indicator wings */}
                <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                    <path
                        d={`M -${pitchR},0 A ${pitchR},${pitchR} 0 0,0 ${pitchR},0`}
                        fill="transparent"
                        stroke="yellow"
                        strokeWidth={wingWidth}
                    />
                    <line x1={-pitchR} y1={0} x2={-wingLength} y2={0} stroke="yellow" strokeWidth={wingWidth} />
                    <line x1={pitchR} y1={0} x2={wingLength} y2={0} stroke="yellow" strokeWidth={wingWidth} />
                </g>
            </g>
        </svg>
    );
};
