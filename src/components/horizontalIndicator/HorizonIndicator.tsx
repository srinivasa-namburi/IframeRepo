import React from "react";

interface HorizonIndicatorProps {
    pitch: number; // degrees, positive = nose up
    roll: number; // degrees, positive = right wing down
    yaw: number; // degrees, 0 = nose north
    size?: number; // optional, default 100
    opacity?: number; // optional, default 1
}

export const HorizonIndicator: React.FC<HorizonIndicatorProps> = ({
                                                                      pitch,
                                                                      roll,
                                                                      yaw,
                                                                      size = 100,
                                                                      opacity = 1,
                                                                  }) => {
    const radius = size / 2;
    const maxPitch = 90;

    const ringWidth = size * 0.1;

    const yawOuterRadius = radius;
    const yawInnerRadius = yawOuterRadius - ringWidth;

    const rollOuterRadius = yawInnerRadius;
    const rollInnerRadius = rollOuterRadius - ringWidth;

    const pitchR = rollInnerRadius * 0.25;
    const wingLength = rollInnerRadius * 0.7;
    const wingWidth = size * 0.03;

    const pitchMarks = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);
    const rollMarks = [-90, -60, -30, -20, -10, 0, 10, 20, 30, 60, 90];
    const specialCircles = [-45, 45];

    const pitchToY = (p: number) => (p / maxPitch) * radius * 2;
    const horizonY = radius + pitchToY(pitch);
    const clampedHorizonY = Math.min(Math.max(horizonY, 0), size);

    const yawSectors = Array.from({ length: 16 }, (_, i) => i * 22.5);
    const yawCardinals = [0, 90, 180, 270];

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
                <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A0D8FF" />
                    <stop offset="100%" stopColor="#4DA6FF" />
                </linearGradient>
            </defs>

            <g opacity={opacity}>
                {/* Outer circle */}
                <circle cx={radius} cy={radius} r={radius} fill="#222" stroke="#333" strokeWidth={2} />

                {/* Horizon */}
                <g
                    clipPath="url(#horizonClip)"
                    transform={`translate(${radius},${radius}) rotate(${roll}) translate(${-radius},${-radius})`}
                >
                    <rect x={0} y={0} width={size} height={clampedHorizonY} fill="url(#skyGradient)" />
                    <rect x={0} y={clampedHorizonY} width={size} height={size - clampedHorizonY} fill="#6E4B3A" />
                    <line x1={0} y1={clampedHorizonY} x2={size} y2={clampedHorizonY} stroke="white" strokeWidth={2} />
                    {pitchMarks.map((t) => (
                        <g key={t}>
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

                {/* Yaw ring */}
                <g transform={`translate(${radius},${radius}) rotate(${-yaw})`}>
                    {yawSectors.map((startAngle, i) => {
                        const endAngle = startAngle + 22.5;
                        const color = i % 2 === 0 ? "white" : "black";

                        const x1 = Math.sin((startAngle * Math.PI) / 180) * yawOuterRadius;
                        const y1 = -Math.cos((startAngle * Math.PI) / 180) * yawOuterRadius;
                        const x2 = Math.sin((startAngle * Math.PI) / 180) * yawInnerRadius;
                        const y2 = -Math.cos((startAngle * Math.PI) / 180) * yawInnerRadius;

                        const x3 = Math.sin((endAngle * Math.PI) / 180) * yawInnerRadius;
                        const y3 = -Math.cos((endAngle * Math.PI) / 180) * yawInnerRadius;
                        const x4 = Math.sin((endAngle * Math.PI) / 180) * yawOuterRadius;
                        const y4 = -Math.cos((endAngle * Math.PI) / 180) * yawOuterRadius;

                        return (
                            <path
                                key={i}
                                d={`
                  M ${x1} ${y1}
                  L ${x2} ${y2}
                  A ${yawInnerRadius} ${yawInnerRadius} 0 0 1 ${x3} ${y3}
                  L ${x4} ${y4}
                  A ${yawOuterRadius} ${yawOuterRadius} 0 0 0 ${x1} ${y1}
                  Z
                `}
                                fill={color}
                                stroke="black"
                                strokeWidth={0.5}
                            />
                        );
                    })}

                    {yawCardinals.map((angle) => {
                        const angleRad = (angle * Math.PI) / 180;
                        const outer = yawOuterRadius;
                        const inner = yawInnerRadius;

                        const tipX = Math.sin(angleRad) * outer;
                        const tipY = -Math.cos(angleRad) * outer;

                        const baseHalf = ringWidth * 0.75;
                        const perpAngle = angleRad + Math.PI / 2;

                        const base1X = Math.sin(angleRad) * inner + Math.sin(perpAngle) * baseHalf;
                        const base1Y = -Math.cos(angleRad) * inner - Math.cos(perpAngle) * baseHalf;
                        const base2X = Math.sin(angleRad) * inner - Math.sin(perpAngle) * baseHalf;
                        const base2Y = -Math.cos(angleRad) * inner + Math.cos(perpAngle) * baseHalf;

                        if (angle === 90) {
                            return <polygon key={angle} points={`${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}`} fill="red" />;
                        } else {
                            const midX = (base1X + base2X) / 2;
                            const midY = (base1Y + base2Y) / 2;
                            return (
                                <g key={angle}>
                                    <polygon points={`${tipX},${tipY} ${base1X},${base1Y} ${midX},${midY}`} fill="black" />
                                    <polygon points={`${tipX},${tipY} ${midX},${midY} ${base2X},${base2Y}`} fill="white" />
                                </g>
                            );
                        }
                    })}
                </g>

                {/* Roll ring */}
                <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                    {/* Top half */}
                    <path
                        d={`
              M ${-rollOuterRadius},0
              A ${rollOuterRadius} ${rollOuterRadius} 0 0 1 ${rollOuterRadius},0
              L ${rollInnerRadius} 0
              A ${rollInnerRadius} ${rollInnerRadius} 0 0 0 ${-rollInnerRadius},0
              Z
            `}
                        fill="#4DA6FF"
                    />
                    {/* Bottom half */}
                    <path
                        d={`
              M ${-rollOuterRadius},0
              A ${rollOuterRadius} ${rollOuterRadius} 0 0 0 ${rollOuterRadius},0
              L ${rollInnerRadius} 0
              A ${rollInnerRadius} ${rollInnerRadius} 0 0 1 ${-rollInnerRadius},0
              Z
            `}
                        fill="#6E4B3A"
                    />

                    <circle cx={0} cy={0} r={rollOuterRadius} fill="none" stroke="yellow" strokeWidth={2} />
                    <circle cx={0} cy={0} r={rollInnerRadius} fill="none" stroke="yellow" strokeWidth={2} />

                    {rollMarks.map((r) => {
                        const angleRad = (r * Math.PI) / 180;
                        const x1 = Math.sin(angleRad) * rollInnerRadius;
                        const y1 = -Math.cos(angleRad) * rollInnerRadius;
                        const x2 = Math.sin(angleRad) * rollOuterRadius;
                        const y2 = -Math.cos(angleRad) * rollOuterRadius;
                        return <line key={r} x1={x1} y1={y1} x2={x2} y2={y2} stroke="yellow" strokeWidth={1.5} />;
                    })}

                    {specialCircles.map((r) => {
                        const angleRad = (r * Math.PI) / 180;
                        const ringRadius = (rollInnerRadius + rollOuterRadius) / 2;
                        const cx = Math.sin(angleRad) * ringRadius;
                        const cy = -Math.cos(angleRad) * ringRadius;
                        const specialCircleRadius = Math.min(4, ringWidth * 0.4);
                        return <circle key={r} cx={cx} cy={cy} r={specialCircleRadius} fill="red" />;
                    })}
                </g>

                {/* Roll indicator triangle */}
                <polygon
                    points={`
            ${radius},${radius - rollOuterRadius + ringWidth * 0.5}
            ${radius - ringWidth / 3},${radius - rollOuterRadius}
            ${radius + ringWidth / 3},${radius - rollOuterRadius}
          `}
                    fill="yellow"
                />

                {/* Smooth Pitch indicator */}
                <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                    <path
                        d={`
              M ${-wingLength},0
              L ${-pitchR},0
              A ${pitchR},${pitchR} 0 0,0 ${pitchR},0
              L ${wingLength},0
            `}
                        fill="transparent"
                        stroke="yellow"
                        strokeWidth={wingWidth}
                        strokeLinecap="round"
                    />
                </g>
            </g>
            {/* Smooth Pitch indicator */}
            <g transform={`translate(${radius},${radius}) rotate(${roll})`}>
                <path
                    d={`
          M ${-wingLength},0
          L ${-pitchR},0
          A ${pitchR},${pitchR} 0 0,0 ${pitchR},0
          L ${wingLength},0
        `}
                    fill="transparent"
                    stroke="yellow"
                    strokeWidth={wingWidth}
                    strokeLinecap="round"
                />
                {/* Center dot */}
                <circle cx={0} cy={0} r={wingWidth / 2} fill="yellow" />
            </g>
        </svg>
    );
};
