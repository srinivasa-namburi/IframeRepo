import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type {StyleModeName} from "../luciadmap/utils/HSPCLoader.ts";

interface PointStyleSelectModeProps {
    onChange: (mode: StyleModeName) => void;
    mode: StyleModeName;
}

export const PointStyleSelectMode: React.FC<PointStyleSelectModeProps> = ({ onChange, mode }) => {

    const handleChange = (event: any) => {
        const selectedMode = event.target.value as StyleModeName;
        if (typeof onChange === "function") onChange(selectedMode);
    };

    return (
        <Select
            value={mode}
            onChange={handleChange}
            size="small"
            sx={{
                width: 100,
                bgcolor: "primary.main",
                color: "white",
                fontSize: "0.875rem",
                "& .MuiSvgIcon-root": { color: "white", fontSize: "1rem" },
                "&:hover": { bgcolor: "primary.dark" },
                zIndex: 1000,
            }}
        >
            <MenuItem value="rgb">RGB</MenuItem>
            <MenuItem value="vertical">Height</MenuItem>
            <MenuItem value="intensity">Intensity</MenuItem>
        </Select>
    );
};
