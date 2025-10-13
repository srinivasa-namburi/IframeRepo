import React from "react";

interface VolumeBannerProps {
    volume: number | null | undefined;
}

export const VolumeBanner: React.FC<VolumeBannerProps> = ({ volume }) => {
    if (volume == null) return null; // show nothing

    const formattedVolume = volume.toLocaleString(undefined, { maximumFractionDigits: 2 });

    return (
        <div
            style={{
                marginLeft: "5px",
                padding: "8px 12px",
                fontWeight: "bold",
                backgroundColor: "#6c757d", // muted gray for informational
                color: "white",
                borderRadius: "4px",
                display: "inline-block",
                fontSize: "14px",
                fontStyle: "italic", // subtle emphasis on info
            }}
            title={`${formattedVolume} cubic meters (informational only)`}
        >
            {formattedVolume} m³
        </div>
    );
};
