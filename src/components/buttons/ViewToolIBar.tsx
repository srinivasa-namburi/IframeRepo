import React, {useRef} from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";

import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";


import type { WebGLMap } from "@luciad/ria/view/WebGLMap.js";
import type { TileSet3DLayer } from "@luciad/ria/view/tileset/TileSet3DLayer.js";
import {type Camera_Face_Type, setCameraOnPreferredSpot} from "../luciadmap/utils/camera/CameraUtils.ts";

const FacesArray = ["front", "right", "back", "left"];

interface Props {
    mapRef: React.RefObject<WebGLMap | null>;
    layerState: TileSet3DLayer | null;
}

export const ViewToolIBar: React.FC<Props> = ({ mapRef, layerState }) => {
    const n = useRef(0);
    const actions = [
        {
            icon: <CenterFocusStrongIcon />,
            name: "Center",
            onClick: () => {
                if (mapRef.current && layerState) {
                    setCameraOnPreferredSpot({map: mapRef.current, layer: layerState, duration: 500});
                    // mapRef.current.mapNavigator.fit({
                    //     bounds: layerState.bounds,
                    //     animate: { duration: 500 },
                    // });
                }
            },
        },
        {
            icon: <RotateLeftIcon />,
            name: "Rotate Left",
            onClick: () => {
                if (mapRef.current && layerState) {
//                    turn(mapRef.current, -1);
                    n.current = (n.current+1) % 4;
                    setCameraOnPreferredSpot({map: mapRef.current, layer: layerState, face: FacesArray[n.current] as Camera_Face_Type, duration: 500} );
                }
            },
        },
        {
            icon: <RotateRightIcon />,
            name: "Rotate Right",
            onClick: () => {
                if (mapRef.current && layerState) {
                    // turn(mapRef.current, 1);
                    n.current = ((n.current+4)-1) % 4;
                    setCameraOnPreferredSpot({map: mapRef.current, layer: layerState, face: FacesArray[n.current] as Camera_Face_Type, duration: 500} );
                }
            },
        },
        // {
        //     icon: <LandscapeIcon />,
        //     name: "Horizon",
        //     onClick: () => {
        //         if (mapRef.current) carPerspective(mapRef.current);
        //     },
        // },
        // {
        //     icon: <VisibilityIcon />,
        //     name: "Top",
        //     onClick: () => {
        //         if (mapRef.current) helicopterPerspective(mapRef.current);
        //     },
        // },

    ];

    return (
        <SpeedDial
            ariaLabel="View Tools"
            sx={{
                position: "fixed",
                top: 16,
                right: 16,
                bgcolor: "transparent", // fully transparent background
                pointerEvents: "none",  // do not block mouse events
                "& .MuiSpeedDial-fab": {
                    bgcolor: "primary.main",
                    color: "white",
                    pointerEvents: "auto", // allow clicks on the FAB
                    "&:hover": { bgcolor: "primary.dark" },
                },
                "& .MuiSpeedDial-actions": {
                    pointerEvents: "auto", // allow clicks on the actions
                },
            }}
            icon={<SpeedDialIcon />}
            direction="down"
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.onClick}
                />
            ))}
        </SpeedDial>
    );
};
