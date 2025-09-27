import React from 'react';
import './VerticalGradient.css';

interface VerticalGradientProps {
    gradient: string[];  // The gradient colors
    min: number;         // Minimum value (bottom of the gradient)
    max: number;         // Maximum value (top of the gradient)
}

export const VerticalGradient: React.FC<VerticalGradientProps> = ({ gradient, min, max }) => {
    // Calculate the value steps for each color
    const valueStep = (max - min) / (gradient.length - 1);
    const valueMarks = gradient.map((_, index) => min + index * valueStep);

    // Create the gradient string for CSS
    const gradientString = gradient.join(', ');

    return (
        <div className="vertical-gradient-container">
            {/* Left side: Gradient */}
            <div
                className="gradient-bar"
                style={{
                    background: `linear-gradient(to top, ${gradientString})`,  // Gradient from bottom to top
                }}
            />

            {/* Right side: Marking Area */}
            <div className="marking-area">
                {/* Markings */}
                {valueMarks.map((value, index) => {
                    const position = ((index / (gradient.length - 1)) * 100); // Correct position calculation from bottom to top
                    return (
                        <div
                            key={index}
                            className="mark"
                            style={{ top: `${100 - position}%` }} // Place from bottom to top
                        >
                            <div className="marker-line" />
                            <span>{value.toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
