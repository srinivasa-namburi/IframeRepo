import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type {StyleModeName} from "../luciadmap/utils/HSPCLoader.ts";

export interface SelectControlOptions {
    value: string;
    label: string;
    title?: string;
}

interface ButtonSelectOptionsProps {
    onChange: (mode: string) => void;
    mode: string;
    options: SelectControlOptions[];
}

export const ButtonSelectOptions: React.FC<ButtonSelectOptionsProps> = ({ onChange, mode, options }) => {

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
            {options.map(option=> <MenuItem value={option.value} title={option.title} key={option.value}>{option.label}</MenuItem>)}
        </Select>
    );
};
