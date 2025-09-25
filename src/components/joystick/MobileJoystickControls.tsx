// MobileJoystickControls.tsx
import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface MobileJoystickControlsProps {
    onMove: (dx: number, dy: number) => void; // -1..1 values for horizontal/vertical movement
    onUp: (active: boolean) => void;          // move up
    onDown: (active: boolean) => void;        // move down
}

export const MobileJoystickControls: React.FC<MobileJoystickControlsProps> = ({ onMove, onUp, onDown }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
    const joystickRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const maxRadius = 50; // joystick radius

    // Keep the normalized values for continuous reporting
    const dxRef = useRef(0);
    const dyRef = useRef(0);
    const intervalRef = useRef<number | null>(null);

    // Detect mobile device
    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const mobile = /android|iphone|ipad|iPod|windows phone/i.test(ua);
        setIsMobile(mobile);
    }, []);

    // Start interval to continuously send onMove
    useEffect(() => {
        if (!isMobile) return;
        intervalRef.current = window.setInterval(() => {
            if (dxRef.current !== 0 || dyRef.current !== 0) {
                onMove(dxRef.current, dyRef.current);
            }
        }, 50); // every 50ms

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isMobile, onMove]);

    if (!isMobile) return null;

    const dispatchKey = (key: string, down: boolean) => {
        window.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { key }));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragging || !joystickRef.current) return;

        const rect = joystickRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const dx = touch.clientX - (rect.left + rect.width / 2);
        const dy = touch.clientY - (rect.top + rect.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const limitedDistance = Math.min(distance, maxRadius);
        const x = Math.cos(angle) * limitedDistance;
        const y = Math.sin(angle) * limitedDistance;

        setJoystickPos({ x, y });

        const normX = x / maxRadius;
        const normY = -y / maxRadius; // forward/backward

        dxRef.current = normX;
        dyRef.current = normY;

        // Immediate dispatch for keyboard arrows
        dispatchKey(normX > 0.3 ? "ArrowRight" : "ArrowRight", normX > 0.3);
        dispatchKey(normX < -0.3 ? "ArrowLeft" : "ArrowLeft", normX < -0.3);
        dispatchKey(normY > 0.3 ? "ArrowUp" : "ArrowUp", normY > 0.3);
        dispatchKey(normY < -0.3 ? "ArrowDown" : "ArrowDown", normY < -0.3);
    };

    const handleTouchEnd = () => {
        setDragging(false);
        setJoystickPos({ x: 0, y: 0 });
        dxRef.current = 0;
        dyRef.current = 0;
        onMove(0, 0);
    };

    // Up/Down button handlers
    const handleUpTouchStart = () => onUp(true);
    const handleUpTouchEnd = () => onUp(false);
    const handleDownTouchStart = () => onDown(true);
    const handleDownTouchEnd = () => onDown(false);

    return (
        <>
            {/* Joystick */}
            <Box
                onContextMenu={(e) => e.preventDefault()}  // prevent long-press menu
                ref={joystickRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                sx={{
                    position: "fixed",
                    bottom: 60,
                    left: 20,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    touchAction: "none",
                    zIndex: 3000,
                }}
            >
                <Box
                    ref={thumbRef}
                    onTouchStart={(e) => e.preventDefault()} // <- prevent magnifier on thumb
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        backgroundColor: "rgba(200,200,200,0.8)",
                        transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                        transition: dragging ? "none" : "transform 0.2s ease",
                    }}
                />
            </Box>

            {/* Up/Down Buttons */}
            <Box sx={{ position: "fixed", bottom: 80, right: 20, display: "flex", flexDirection: "column", gap: 5, zIndex: 3000 }}>
                <Box
                    onContextMenu={(e) => e.preventDefault()}
                    onTouchStart={ (e) => {e.preventDefault(); handleUpTouchStart()}}
                    onTouchEnd={handleUpTouchEnd}
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 24,
                        color: "white",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                >
                    ↑
                </Box>
                <Box
                    onContextMenu={(e) => e.preventDefault()}
                    onTouchStart={(e) => {e.preventDefault(); handleDownTouchStart()}}
                    onTouchEnd={handleDownTouchEnd}
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 24,
                        color: "white",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                >
                    ↓
                </Box>
            </Box>
        </>
    );
};
