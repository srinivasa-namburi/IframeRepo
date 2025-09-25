// MobileJoystickControls.tsx
import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface MobileJoystickControlsProps {
    onLeftJoystickMove: (dx: number, dy: number) => void; // left joystick
    onUp: (active: boolean) => void; // move up
    onDown: (active: boolean) => void; // move down
    onRightJoystickMove: (dx: number, dy: number) => void; // right joystick
}

export const MobileJoystickControls: React.FC<MobileJoystickControlsProps> = ({
                                                                                  onLeftJoystickMove,
                                                                                  onUp,
                                                                                  onDown,
                                                                                  onRightJoystickMove,
                                                                              }) => {
    const [isMobile, setIsMobile] = useState(false);

    // ===== Left joystick state =====
    const [draggingLeft, setDraggingLeft] = useState(false);
    const [leftPos, setLeftPos] = useState({ x: 0, y: 0 });
    const leftJoystickRef = useRef<HTMLDivElement | null>(null);
    const leftDxRef = useRef(0);
    const leftDyRef = useRef(0);

    // ===== Right joystick state =====
    const [draggingRight, setDraggingRight] = useState(false);
    const [rightPos, setRightPos] = useState({ x: 0, y: 0 });
    const rightJoystickRef = useRef<HTMLDivElement | null>(null);
    const rightDxRef = useRef(0);
    const rightDyRef = useRef(0);

    const intervalRef = useRef<number | null>(null);
    const maxRadius = 50;

    // Detect mobile device
    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const mobile = /android|iphone|ipad|iPod|windows phone/i.test(ua);
        setIsMobile(mobile);
    }, []);

    // Continuous reporting loop
    useEffect(() => {
        if (!isMobile) return;
        intervalRef.current = window.setInterval(() => {
            if (leftDxRef.current !== 0 || leftDyRef.current !== 0) {
                onLeftJoystickMove(leftDxRef.current, leftDyRef.current);
            }
            if (rightDxRef.current !== 0 || rightDyRef.current !== 0) {
                onRightJoystickMove(rightDxRef.current, rightDyRef.current);
            }
        }, 50);

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isMobile, onLeftJoystickMove, onRightJoystickMove]);

    if (!isMobile) return null;

    // ===== Shared joystick handlers =====
    const handleTouchStart =
        (setDragging: React.Dispatch<React.SetStateAction<boolean>>) =>
            (e: React.TouchEvent) => {
                e.preventDefault();
                setDragging(true);
            };

    const handleTouchMove = (
        e: React.TouchEvent,
        ref: React.RefObject<HTMLDivElement | null>,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>
    ) => {
        e.preventDefault();
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const touch = e.touches[0];
        const dx = touch.clientX - (rect.left + rect.width / 2);
        const dy = touch.clientY - (rect.top + rect.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const limitedDistance = Math.min(distance, maxRadius);
        const x = Math.cos(angle) * limitedDistance;
        const y = Math.sin(angle) * limitedDistance;

        setPos({ x, y });

        dxRef.current = x / maxRadius;
        dyRef.current = -y / maxRadius; // invert Y
    };

    const handleTouchEnd = (
        setDragging: React.Dispatch<React.SetStateAction<boolean>>,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>
    ) => {
        setDragging(false);
        setPos({ x: 0, y: 0 });
        dxRef.current = 0;
        dyRef.current = 0;
    };

    // Up/Down button handlers
    const handleUpTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        onUp(true);
    };
    const handleUpTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        onUp(false);
    };
    const handleDownTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        onDown(true);
    };
    const handleDownTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        onDown(false);
    };

    return (
        <>
            {/* Left Joystick */}
            <Box
                ref={leftJoystickRef}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={handleTouchStart(setDraggingLeft)}
                onTouchMove={(e) =>
                    handleTouchMove(e, leftJoystickRef, setLeftPos, leftDxRef, leftDyRef)
                }
                onTouchEnd={() =>
                    handleTouchEnd(setDraggingLeft, setLeftPos, leftDxRef, leftDyRef)
                }
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
                    userSelect: "none",
                }}
                style={{ WebkitUserSelect: "none" }}
            >
                <Box
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        backgroundColor: "rgba(200,200,200,0.8)",
                        transform: `translate(${leftPos.x}px, ${leftPos.y}px)`,
                        transition: draggingLeft ? "none" : "transform 0.2s ease",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                    style={{ WebkitUserSelect: "none" }}
                />
            </Box>

            {/* Right Joystick */}
            <Box
                ref={rightJoystickRef}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={handleTouchStart(setDraggingRight)}
                onTouchMove={(e) =>
                    handleTouchMove(e, rightJoystickRef, setRightPos, rightDxRef, rightDyRef)
                }
                onTouchEnd={() =>
                    handleTouchEnd(setDraggingRight, setRightPos, rightDxRef, rightDyRef)
                }
                sx={{
                    position: "fixed",
                    bottom: 60,
                    right: 20,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    touchAction: "none",
                    zIndex: 3000,
                    userSelect: "none",
                }}
                style={{ WebkitUserSelect: "none" }}
            >
                <Box
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        backgroundColor: "rgba(200,200,200,0.8)",
                        transform: `translate(${rightPos.x}px, ${rightPos.y}px)`,
                        transition: draggingRight ? "none" : "transform 0.2s ease",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                    style={{ WebkitUserSelect: "none" }}
                />
            </Box>

            {/* Up/Down Buttons (centered) */}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 40,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    zIndex: 3000,
                }}
            >
                <Box
                    onContextMenu={(e) => e.preventDefault()}
                    onTouchStart={handleUpTouchStart}
                    onTouchEnd={handleUpTouchEnd}
                    onTouchMove={(e) => e.preventDefault()}
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 24,
                        color: "white",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                    style={{ WebkitUserSelect: "none" }}
                >
                    ↑
                </Box>
                <Box
                    onContextMenu={(e) => e.preventDefault()}
                    onTouchStart={handleDownTouchStart}
                    onTouchEnd={handleDownTouchEnd}
                    onTouchMove={(e) => e.preventDefault()}
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 24,
                        color: "white",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                    style={{ WebkitUserSelect: "none" }}
                >
                    ↓
                </Box>
            </Box>
        </>
    );
};
