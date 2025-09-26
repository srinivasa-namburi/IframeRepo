// MobileJoystickControls.tsx
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

interface MobileJoystickControlsProps {
    onLeftJoystickMove: (dx: number, dy: number) => void; // left joystick
    onUp: (active: boolean) => void; // move up
    onDown: (active: boolean) => void; // move down
    onRightJoystickMove: (dx: number, dy: number) => void; // right joystick
}

const ZIndexButtons = 999;
const ZIndexJoysticks = 999;
const maxRadius = 50;
const deadZone = 0.1; // Dead zone: ignore small movements near center

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
    const leftPointerIdRef = useRef<number | null>(null);
    const leftDxRef = useRef(0);
    const leftDyRef = useRef(0);

    // ===== Right joystick state =====
    const [draggingRight, setDraggingRight] = useState(false);
    const [rightPos, setRightPos] = useState({ x: 0, y: 0 });
    const rightJoystickRef = useRef<HTMLDivElement | null>(null);
    const rightPointerIdRef = useRef<number | null>(null);
    const rightDxRef = useRef(0);
    const rightDyRef = useRef(0);

    const animationRef = useRef<number | null>(null);

    // detect mobile-ish devices
    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const mobile = /android|iphone|ipad|iPod|windows phone/i.test(ua);
        setIsMobile(mobile);
    }, []);

    // continuous reporting loop using requestAnimationFrame
    useEffect(() => {
        if (!isMobile) return;

        const loop = () => {
            // left joystick dead zone
            const leftDx = Math.abs(leftDxRef.current) < deadZone ? 0 : leftDxRef.current;
            const leftDy = Math.abs(leftDyRef.current) < deadZone ? 0 : leftDyRef.current;
            if (leftDx !== 0 || leftDy !== 0) {
                onLeftJoystickMove(leftDx, leftDy);
            }

            // right joystick dead zone
            const rightDx = Math.abs(rightDxRef.current) < deadZone ? 0 : rightDxRef.current;
            const rightDy = Math.abs(rightDyRef.current) < deadZone ? 0 : rightDyRef.current;
            if (rightDx !== 0 || rightDy !== 0) {
                onRightJoystickMove(rightDx, rightDy);
            }

            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);

        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isMobile, onLeftJoystickMove, onRightJoystickMove]);

    if (!isMobile) return null;

    // helper to compute normalized joystick values from pointer position
    const computeJoystickFromPointer = (
        clientX: number,
        clientY: number,
        el: HTMLDivElement,
        setPos: (p: { x: number; y: number }) => void,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>
    ) => {
        const rect = el.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const limitedDistance = Math.min(distance, maxRadius);
        const x = Math.cos(angle) * limitedDistance;
        const y = Math.sin(angle) * limitedDistance;

        setPos({ x, y });
        dxRef.current = x / maxRadius;
        dyRef.current = -y / maxRadius; // invert Y so up is positive
    };

    // unified finish pointer function
    const finishPointer = (
        pointerIdRef: React.MutableRefObject<number | null>,
        setDragging: React.Dispatch<React.SetStateAction<boolean>>,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>,
        elRef: React.RefObject<HTMLDivElement | null>
    ) => {
        const el = elRef.current;
        if (el && pointerIdRef.current !== null) {
            try {
                el.releasePointerCapture?.(pointerIdRef.current);
            } catch {}
        }
        pointerIdRef.current = null;
        setDragging(false);
        setPos({ x: 0, y: 0 });
        dxRef.current = 0;
        dyRef.current = 0;
    };

    // ---------- LEFT joystick pointer handlers ----------
    const onLeftPointerDown = (e: React.PointerEvent) => {
        if (e.button && e.pointerType === "mouse") return;
        e.preventDefault();
        const el = leftJoystickRef.current;
        if (!el) return;
        leftPointerIdRef.current = e.pointerId;
        el.setPointerCapture?.(e.pointerId);
        setDraggingLeft(true);
        computeJoystickFromPointer(e.clientX, e.clientY, el, setLeftPos, leftDxRef, leftDyRef);
    };
    const onLeftPointerMove = (e: React.PointerEvent) => {
        e.preventDefault();
        if (leftPointerIdRef.current !== e.pointerId) return;
        const el = leftJoystickRef.current;
        if (!el) return;
        computeJoystickFromPointer(e.clientX, e.clientY, el, setLeftPos, leftDxRef, leftDyRef);
    };
    const onLeftPointerUp = (e: React.PointerEvent) => {
        if (leftPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishPointer(leftPointerIdRef, setDraggingLeft, setLeftPos, leftDxRef, leftDyRef, leftJoystickRef);
    };
    const onLeftPointerCancel = (e: React.PointerEvent) => {
        if (leftPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishPointer(leftPointerIdRef, setDraggingLeft, setLeftPos, leftDxRef, leftDyRef, leftJoystickRef);
    };

    // ---------- RIGHT joystick pointer handlers ----------
    const onRightPointerDown = (e: React.PointerEvent) => {
        if (e.button && e.pointerType === "mouse") return;
        e.preventDefault();
        const el = rightJoystickRef.current;
        if (!el) return;
        rightPointerIdRef.current = e.pointerId;
        el.setPointerCapture?.(e.pointerId);
        setDraggingRight(true);
        computeJoystickFromPointer(e.clientX, e.clientY, el, setRightPos, rightDxRef, rightDyRef);
    };
    const onRightPointerMove = (e: React.PointerEvent) => {
        e.preventDefault();
        if (rightPointerIdRef.current !== e.pointerId) return;
        const el = rightJoystickRef.current;
        if (!el) return;
        computeJoystickFromPointer(e.clientX, e.clientY, el, setRightPos, rightDxRef, rightDyRef);
    };
    const onRightPointerUp = (e: React.PointerEvent) => {
        if (rightPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishPointer(rightPointerIdRef, setDraggingRight, setRightPos, rightDxRef, rightDyRef, rightJoystickRef);
    };
    const onRightPointerCancel = (e: React.PointerEvent) => {
        if (rightPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishPointer(rightPointerIdRef, setDraggingRight, setRightPos, rightDxRef, rightDyRef, rightJoystickRef);
    };

    // Up/Down handlers
    const handleUpPointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        onUp(true);
    };
    const handleUpPointerUp = (e: React.PointerEvent) => {
        e.preventDefault();
        onUp(false);
    };
    const handleDownPointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        onDown(true);
    };
    const handleDownPointerUp = (e: React.PointerEvent) => {
        e.preventDefault();
        onDown(false);
    };

    return (
        <>
            {/* Left Joystick */}
            <Box
                ref={leftJoystickRef}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={onLeftPointerDown}
                onPointerMove={onLeftPointerMove}
                onPointerUp={onLeftPointerUp}
                onPointerCancel={onLeftPointerCancel}
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
                    zIndex: ZIndexJoysticks,
                    userSelect: "none",
                }}
            >
                <Box
                    onPointerDown={(e) => e.preventDefault()}
                    onPointerMove={(e) => e.preventDefault()}
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
                />
            </Box>

            {/* Right Joystick */}
            <Box
                ref={rightJoystickRef}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={onRightPointerDown}
                onPointerMove={onRightPointerMove}
                onPointerUp={onRightPointerUp}
                onPointerCancel={onRightPointerCancel}
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
                    zIndex: ZIndexJoysticks,
                    userSelect: "none",
                }}
            >
                <Box
                    onPointerDown={(e) => e.preventDefault()}
                    onPointerMove={(e) => e.preventDefault()}
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
                    gap: 4,
                    zIndex: ZIndexButtons,
                }}
            >
                <Box
                    onContextMenu={(e) => e.preventDefault()}
                    onPointerDown={handleUpPointerDown}
                    onPointerUp={handleUpPointerUp}
                    onPointerCancel={handleUpPointerUp}
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
                    onPointerDown={handleDownPointerDown}
                    onPointerUp={handleDownPointerUp}
                    onPointerCancel={handleDownPointerUp}
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
