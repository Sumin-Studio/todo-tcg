"use client";

import { useEffect, useRef, useState } from "react";

interface FrameBoosterPackProps {
  onOpen: () => void;
}

const TOTAL_FRAMES = 216;
const INTRO_END = 91;       // last frame of intro phase
const SWIPE_START = 92;     // first swipe frame
const SWIPE_END = 113;      // last swipe frame (pack stays here through slideup)
const FPS = 60;
const FRAME_W = 540;
const FRAME_H = 960;
const SWIPE_PX = 200;
const SLIDEUP_MS = 1000;    // card-up + pack-down animation duration

const frameUrl = (i: number) => `/pack-frames/${String(i).padStart(3, "0")}.webp`;

type Phase = "preloading" | "intro" | "swipe" | "slideup";

export default function FrameBoosterPack({ onOpen }: FrameBoosterPackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const onOpenCalledRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("preloading");
  const [showHint, setShowHint] = useState(false);

  // Draw current frame (float index), anchored to BOTTOM of viewport.
  // Cross-fades between adjacent source frames so motion is smooth at the
  // display's refresh rate rather than snapping to 30 discrete steps.
  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const i0 = Math.floor(index);
    const i1 = Math.min(TOTAL_FRAMES - 1, i0 + 1);
    const t = index - i0;
    const img0 = framesRef.current[i0];
    const img1 = framesRef.current[i1];
    if (!img0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.min(cw / FRAME_W, ch / FRAME_H);
    const dw = FRAME_W * scale;
    const dh = FRAME_H * scale;
    const dx = (cw - dw) / 2;
    const dy = ch - dh; // bottom-aligned

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, cw, ch);
    ctx.globalAlpha = 1;
    ctx.drawImage(img0, dx, dy, dw, dh);
    if (img1 && i1 !== i0 && t > 0) {
      ctx.globalAlpha = t;
      ctx.drawImage(img1, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }
    currentFrameRef.current = index;
  }

  // Size canvas to viewport at devicePixelRatio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      drawFrame(currentFrameRef.current);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Preload — intro batch first, the rest in background
  useEffect(() => {
    let cancelled = false;

    function loadOne(index: number): Promise<void> {
      return new Promise((resolve) => {
        if (framesRef.current[index]) return resolve();
        const img = new Image();
        img.onload = img.onerror = () => {
          framesRef.current[index] = img;
          resolve();
        };
        img.src = frameUrl(index);
      });
    }

    async function preload() {
      const introBatch: Promise<void>[] = [];
      for (let i = 0; i <= INTRO_END; i++) introBatch.push(loadOne(i));
      await Promise.all(introBatch);
      if (cancelled) return;
      drawFrame(0);
      setPhase("intro");

      // Only preload swipe frames; we skip 114–215 since the new design freezes on 113
      for (let i = INTRO_END + 1; i <= SWIPE_END; i++) {
        if (cancelled) return;
        await loadOne(i);
      }
    }
    preload();
    return () => {
      cancelled = true;
    };
  }, []);

  // Phase 1: Intro auto-play (0 → 91)
  useEffect(() => {
    if (phase !== "intro") return;
    const start = performance.now();
    const frameMs = 1000 / FPS;

    function tick(now: number) {
      const elapsed = now - start;
      const frame = Math.min(INTRO_END, elapsed / frameMs);
      drawFrame(frame);
      if (frame >= INTRO_END) {
        setPhase("swipe");
        setShowHint(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Phase 2: Swipe scrub (92 → 113)
  useEffect(() => {
    if (phase !== "swipe") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let startX: number | null = null;
    let pointerId: number | null = null;
    let completing = false;

    function frameFromProgress(progress: number): number {
      const clamped = Math.max(0, Math.min(1, progress));
      return SWIPE_START + clamped * (SWIPE_END - SWIPE_START);
    }

    function animateTo(targetFrame: number, durationMs: number, onDone: () => void) {
      const from = currentFrameRef.current;
      const to = targetFrame;
      const start = performance.now();
      function step(now: number) {
        const t = Math.min(1, (now - start) / durationMs);
        const frame = from + (to - from) * t;
        drawFrame(frame);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          drawFrame(to);
          onDone();
        }
      }
      rafRef.current = requestAnimationFrame(step);
    }

    function onPointerDown(e: PointerEvent) {
      if (completing) return;
      startX = e.clientX;
      pointerId = e.pointerId;
      setShowHint(false);
      canvas?.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (startX == null || pointerId !== e.pointerId || completing) return;
      const progress = (e.clientX - startX) / SWIPE_PX;
      drawFrame(frameFromProgress(progress));
    }

    function onPointerUp(e: PointerEvent) {
      if (startX == null || pointerId !== e.pointerId || completing) return;
      const progress = (e.clientX - startX) / SWIPE_PX;
      startX = null;
      pointerId = null;

      if (progress >= 1) {
        completing = true;
        setPhase("slideup");
      } else if (progress >= 0.5) {
        completing = true;
        const remaining = SWIPE_END - currentFrameRef.current;
        const ms = (remaining / (SWIPE_END - SWIPE_START)) * 350;
        animateTo(SWIPE_END, Math.max(150, ms), () => setPhase("slideup"));
      } else {
        animateTo(SWIPE_START, 250, () => {
          completing = false;
          setShowHint(true);
        });
      }
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Phase 3: Slide-up — pack drops down, card rises to center, simultaneously.
  // Pack stays frozen on frame 113; we animate via CSS transforms.
  useEffect(() => {
    if (phase !== "slideup") return;
    drawFrame(SWIPE_END);
    const t = setTimeout(() => {
      if (!onOpenCalledRef.current) {
        onOpenCalledRef.current = true;
        onOpen();
      }
    }, SLIDEUP_MS);
    return () => clearTimeout(t);
  }, [phase, onOpen]);

  const sliding = phase === "slideup";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      {/* Card-back slides up from below to centered resting position.
          Size matches PackReveal's --card-width/--card-height so the handoff
          is visually identical — same image at same coords. */}
      {sliding && (
        <img
          src="/card-back.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "var(--card-width)",
            height: "var(--card-height)",
            objectFit: "cover",
            borderRadius: "var(--card-radius)",
            transform: "translate(-50%, 50vh)",
            zIndex: 1,
            animation: `fbp-card-up ${SLIDEUP_MS}ms cubic-bezier(0.22, 0.8, 0.36, 1) forwards`,
          }}
        />
      )}

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "block",
          cursor: phase === "swipe" ? "grab" : "default",
          transform: sliding ? "translateY(100vh)" : "translateY(0)",
          transition: sliding
            ? `transform ${SLIDEUP_MS}ms cubic-bezier(0.5, 0, 0.75, 0)`
            : "none",
        }}
      />

      {phase === "preloading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(32,32,32,0.55)",
            fontSize: 14,
            letterSpacing: "0.05em",
          }}
        >
          Loading pack…
        </div>
      )}

      {phase === "swipe" && showHint && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "8vh",
            zIndex: 3,
            textAlign: "center",
            color: "rgba(32,32,32,0.55)",
            fontSize: 14,
            letterSpacing: "0.08em",
            pointerEvents: "none",
            animation: "fbp-fadein 0.6s ease-out forwards",
          }}
        >
          Swipe to open →
        </div>
      )}

      <style>{`
        @keyframes fbp-card-up {
          0%   { transform: translate(-50%, 50vh); }
          100% { transform: translate(-50%, -50%); }
        }
        @keyframes fbp-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
