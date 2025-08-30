import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";


export interface BackgroundColor {
    value: string;
    label: string;
    id: string;
}

interface ColorPickerProps {
    colors: BackgroundColor[];
    onChange: (color: BackgroundColor) => void;
    currentColor?: BackgroundColor;
}

// eslint-disable-next-line react-refresh/only-export-components
export function ColorPickerFindColor(availableColors: BackgroundColor[], storedColor: string | null) {
    const color = availableColors.find(a=> a.id === storedColor);
    return color ? color : availableColors[3];
}


export const ColorPicker: React.FC<ColorPickerProps> = ({ colors, onChange, currentColor }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleColorSelect = (color: string) => {
        onChange(ColorPickerFindColor(colors, color));
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
                <WallpaperIcon fontSize="large" />
            </Box>

            {/* Color menu */}
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {colors.map((color) => (
                    <MenuItem
                        key={color.id}
                        onClick={() => handleColorSelect(color.id)}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        {/* Left group: check + label */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {color === currentColor && <CheckIcon fontSize="small" color="primary" />}
                            </Box>
                            <span>{color.label}</span>
                        </Box>

                        {/* Right: color square */}
                        { color.id==="$sky" ? <Box
                            sx={{
                                width: 24,
                                height: 24,
                                background: "linear-gradient(to bottom, #111111 0%, #333333 33%, #888888 40%, #222222 50%, #000000 100%)",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                marginLeft: "auto", // pushes it all the way to the right
                            }}
                        /> :
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: color.value,
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    marginLeft: "auto", // pushes it all the way to the right
                                }}
                            />
                        }
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
