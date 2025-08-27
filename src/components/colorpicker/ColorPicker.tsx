import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

interface ColorPickerProps {
    colors: string[];
    onChange: (color: string) => void;
    currentColor?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ colors, onChange, currentColor }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleColorSelect = (color: string) => {
        onChange(color);
        handleClose();
    };

    return (
        <>
            {/* Button to open color menu */}
            <Box
                sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: "50%",
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "primary.dark" },
                }}
                onClick={handleClick}
                title="Choose Background Color"
            >
                <FormatColorFillIcon fontSize="large" />
            </Box>

            {/* Color menu */}
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {colors.map((color) => (
                    <MenuItem
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                        }}
                    >
                        {/* Checkmark on the left if selected */}
                        <Box sx={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {color === currentColor && <CheckIcon fontSize="small" color="primary" />}
                        </Box>

                        {/* Color code text */}
                        <span>{color}</span>

                        {/* Color preview square on the right */}
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                bgcolor: color,
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
