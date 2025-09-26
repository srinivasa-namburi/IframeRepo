// NavigationHelpPanel.tsx
import React, { useState, useEffect } from "react";
import {
    Drawer,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    Box,
    Divider,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

const KeyCap: React.FC<{ label: string; wide?: boolean }> = ({ label, wide }) => (
    <Box
        component="span"
        sx={{
            display: "inline-block",
            px: wide ? 1.5 : 0.8,
            py: 0.4,
            mx: 0.2,
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f7f7f7",
            color: "black",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "0.75rem",
            boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.3)",
            minWidth: wide ? 70 : 30,
            textAlign: "center",
        }}
    >
        {label}
    </Box>
);

export const NavigationHelpPanel: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleDrawer = (state: boolean) => () => setOpen(state);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const touchDevice = /android|iphone|ipad|iPod|windows phone/i.test(userAgent);
        setIsMobile(touchDevice);
    }, []);

    // Desktop controls
    const movementControls = [
        { keys: ["↑", "W"], text: "Move Forward" },
        { keys: ["↓", "S"], text: "Move Backward" },
        { keys: ["←", "A"], text: "Move Left" },
        { keys: ["→", "D"], text: "Move Right" },
    ];

    const verticalSpeedControls = [
        { keys: ["E"], text: "Move Up" },
        { keys: ["Q"], text: "Move Down" },
        { keys: ["Shift"], text: "Increase Speed" },
        { keys: ["Space"], text: "Decrease Speed" },
    ];

    const mouseControls = [
        { label: "Left Mouse Drag", text: "Pan View" },
        { label: "Scroll Wheel", text: "Zoom In / Out" },
        { label: "Right Mouse Drag", text: "Rotate View" },
        { label: "Click Label", text: "Zoom To Inspect" },
    ];

    const touchControls = [
        { label: "Swipe One Finger", text: "Pan View" },
        { label: "Pinch Two Fingers", text: "Zoom In / Out" },
        { label: "Swipe Two Fingers", text: "Rotate View" },
        { label: "Tap Label", text: "Zoom To Inspect" },
    ];

    // Mobile-specific instructions
    const joystickControls = [
        { label: "Left Joystick", text: "Move Camera (Left / Right / Forward / Backward)" },
        { label: "Right Joystick", text: "Rotate Camera (look around / head movement)" },
    ];

    const verticalButtons = [
        { label: "↑ / ↓ Buttons", text: "Move Up / Down" },
    ];

    const controlsToRender = isMobile ? touchControls : mouseControls;

    return (
        <>
            {/* Floating Help Button */}
            <IconButton
                color="primary"
                onClick={toggleDrawer(true)}
                sx={{ position: "fixed", top: 18, right: 90, zIndex: 2000 }}
            >
                <HelpOutlineIcon  sx={{ fontSize: 36 }} />
            </IconButton>

            <Drawer
                anchor="right"
                open={open}
                onClose={toggleDrawer(false)}
                ModalProps={{
                    BackdropProps: { sx: { backgroundColor: "rgba(0,0,0,0.1)" } }
                }}
            >
                <Box sx={{ width: 320, p: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            3D Navigation Help
                        </Typography>
                        <IconButton onClick={toggleDrawer(false)} size="small">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {isMobile ? (
                        <>
                            <Typography variant="body2" sx={{ mb: 1 }} fontWeight="bold">
                                Joystick Controls
                            </Typography>

                            <Box sx={{ display: "grid", gap: 1 }}>
                                <List dense>
                                    {joystickControls.map((item, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.3 }}>
                                            <ListItemText
                                                primary={item.label}
                                                secondary={item.text}
                                                primaryTypographyProps={{ fontWeight: "bold", fontSize: "0.75rem" }}
                                                secondaryTypographyProps={{ fontSize: "0.7rem" }}
                                            />
                                        </ListItem>
                                    ))}
                                    {verticalButtons.map((item, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.3 }}>
                                            <ListItemText
                                                primary={item.label}
                                                secondary={item.text}
                                                primaryTypographyProps={{ fontWeight: "bold", fontSize: "0.75rem" }}
                                                secondaryTypographyProps={{ fontSize: "0.7rem" }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" sx={{ mb: 1 }} fontWeight="bold">
                                Keyboard Controls
                            </Typography>
                            <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(2, 1fr)" }}>
                                <Box>
                                    <List dense>
                                        {movementControls.map((item, idx) => (
                                            <ListItem key={idx} sx={{ py: 0.3 }}>
                                                <ListItemText
                                                    primary={<span>{item.keys.map((k, i) => (<KeyCap key={i} label={k} />))}</span>}
                                                    secondary={item.text}
                                                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                                <Box>
                                    <List dense>
                                        {verticalSpeedControls.map((item, idx) => (
                                            <ListItem key={idx} sx={{ py: 0.3 }}>
                                                <ListItemText
                                                    primary={<span>{item.keys.map((k, i) => (<KeyCap key={i} label={k} wide={k === "Shift" || k === "Space"} />))}</span>}
                                                    secondary={item.text}
                                                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Box>
                        </>
                    )}

                    <Divider sx={{ mt: 1 }} />

                    {/* Mouse / Touch Controls */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }} fontWeight="bold">
                            {isMobile ? "Touch Controls" : "Mouse Controls"}
                        </Typography>

                        <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(2, 1fr)" }}>
                            {(() => {
                                const mid = Math.ceil(controlsToRender.length / 2);
                                const left = controlsToRender.slice(0, mid);
                                const right = controlsToRender.slice(mid);

                                return (
                                    <>
                                        <Box>
                                            <List dense>
                                                {left.map((item, idx) => (
                                                    <ListItem key={idx} sx={{ py: 0.3 }}>
                                                        <ListItemText
                                                            primary={item.label}
                                                            secondary={item.text}
                                                            primaryTypographyProps={{ fontWeight: "bold", fontSize: "0.75rem" }}
                                                            secondaryTypographyProps={{ fontSize: "0.7rem" }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>

                                        <Box>
                                            <List dense>
                                                {right.map((item, idx) => (
                                                    <ListItem key={idx} sx={{ py: 0.3 }}>
                                                        <ListItemText
                                                            primary={item.label}
                                                            secondary={item.text}
                                                            primaryTypographyProps={{ fontWeight: "bold", fontSize: "0.75rem" }}
                                                            secondaryTypographyProps={{ fontSize: "0.7rem" }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    </>
                                );
                            })()}
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};
