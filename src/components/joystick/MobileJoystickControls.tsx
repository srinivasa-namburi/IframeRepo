// MobileJoystickControls.tsx
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

interface MobileJoystickControlsProps {
    onLeftJoystickMove: (dx: number, dy: number) => void; // left joystick
    onUp: (active: boolean) => void; // move up
    onDown: (active: boolean) => void; // move down
    onRightJoystickMove: (dx: number, dy: number) => void; // right joystick
}

const ZIndexButtons =  999;
const ZIndexJoysticks =  999;


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

    const intervalRef = useRef<number | null>(null);
    const maxRadius = 50;

    // detect mobile-ish devices (keep as you had it)
    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const mobile = /android|iphone|ipad|iPod|windows phone/i.test(ua);
        setIsMobile(mobile);
    }, []);

    // continuous reporting loop
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

    // helper to compute normalized joystick values from a pointer position
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

    // ---------- LEFT joystick pointer handlers ----------
    const onLeftPointerDown = (e: React.PointerEvent) => {
        // only accept primary pointer (finger / primary mouse button)
        if (e.button && e.pointerType === "mouse") return;
        e.preventDefault();
        const el = leftJoystickRef.current;
        if (!el) return;
        leftPointerIdRef.current = e.pointerId;
        (el as HTMLElement).setPointerCapture?.(e.pointerId);
        setDraggingLeft(true);
        // initialize position immediately
        computeJoystickFromPointer(e.clientX, e.clientY, el, setLeftPos, leftDxRef, leftDyRef);
    };

    const onLeftPointerMove = (e: React.PointerEvent) => {
        e.preventDefault();
        const el = leftJoystickRef.current;
        if (!el) return;
        if (leftPointerIdRef.current !== e.pointerId) return; // ignore other pointers
        computeJoystickFromPointer(e.clientX, e.clientY, el, setLeftPos, leftDxRef, leftDyRef);
    };

    const finishLeftPointer = (_e?: React.PointerEvent) => {
        // optional event used to release capture
        const el = leftJoystickRef.current;
        if (el && leftPointerIdRef.current !== null) {
            try {
                (el as HTMLElement).releasePointerCapture?.(leftPointerIdRef.current);
            } catch {
                /* ignore release errors */
            }
        }
        leftPointerIdRef.current = null;
        setDraggingLeft(false);
        setLeftPos({ x: 0, y: 0 });
        leftDxRef.current = 0;
        leftDyRef.current = 0;
    };

    const onLeftPointerUp = (e: React.PointerEvent) => {
        if (leftPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishLeftPointer(e);
    };

    const onLeftPointerCancel = (e: React.PointerEvent) => {
        if (leftPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishLeftPointer(e);
    };

    // ---------- RIGHT joystick pointer handlers ----------
    const onRightPointerDown = (e: React.PointerEvent) => {
        if (e.button && e.pointerType === "mouse") return;
        e.preventDefault();
        const el = rightJoystickRef.current;
        if (!el) return;
        rightPointerIdRef.current = e.pointerId;
        (el as HTMLElement).setPointerCapture?.(e.pointerId);
        setDraggingRight(true);
        computeJoystickFromPointer(e.clientX, e.clientY, el, setRightPos, rightDxRef, rightDyRef);
    };

    const onRightPointerMove = (e: React.PointerEvent) => {
        e.preventDefault();
        const el = rightJoystickRef.current;
        if (!el) return;
        if (rightPointerIdRef.current !== e.pointerId) return;
        computeJoystickFromPointer(e.clientX, e.clientY, el, setRightPos, rightDxRef, rightDyRef);
    };

    const finishRightPointer = (_e?: React.PointerEvent) => {
        const el = rightJoystickRef.current;
        if (el && rightPointerIdRef.current !== null) {
            try {
                (el as HTMLElement).releasePointerCapture?.(rightPointerIdRef.current);
            } catch {
                /* ignore release errors */
            }
        }
        rightPointerIdRef.current = null;
        setDraggingRight(false);
        setRightPos({ x: 0, y: 0 });
        rightDxRef.current = 0;
        rightDyRef.current = 0;
    };

    const onRightPointerUp = (e: React.PointerEvent) => {
        if (rightPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishRightPointer(e);
    };

    const onRightPointerCancel = (e: React.PointerEvent) => {
        if (rightPointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        finishRightPointer(e);
    };

    // Up/Down handlers (preserve your previous behavior)
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
                    touchAction: "none", // required to allow pointermove without browser gestures
                    zIndex: ZIndexJoysticks,
                    userSelect: "none",
                }}
                style={{ WebkitUserSelect: "none" }}
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
                    style={{ WebkitUserSelect: "none" }}
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
                style={{ WebkitUserSelect: "none" }}
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
                    style={{ WebkitUserSelect: "none" }}
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
                    style={{ WebkitUserSelect: "none" }}
                >
                    ↓
                </Box>
            </Box>
        </>
    );
};
