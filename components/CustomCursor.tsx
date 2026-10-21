"use client";

import { useCallback, useEffect, useState } from "react";

type Burst = {
  id: number;
  x: number;
  y: number;
};

/** Desktop mouse only, and never when the visitor prefers reduced motion. */
function useFinePointer() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(mq.matches && !reduced.matches);
    sync();

    mq.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return enabled;
}

/** Elements that should show the pointing-hand cursor. */
const INTERACTIVE = "a[href], button, summary, label, select, [role='button']";

/** Pointing hand (same geometry as the Lucide "pointer" glyph), outlined for legibility. */
function PointerHand() {
  const d = [
    "M22 14a8 8 0 0 1-8 8",
    "M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2",
    "M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1",
    "M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10",
    "M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 3.83-2.74L6 14",
  ];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {d.map((path) => (
        <path key={`o-${path}`} d={path} stroke="#000" strokeWidth="3.6" />
      ))}
      {d.map((path) => (
        <path key={`f-${path}`} d={path} stroke="#fff" strokeWidth="1.8" />
      ))}
    </svg>
  );
}

/** Four straight tick marks near the cursor tip, revealed left → right. */
function ClickSparks({
  x,
  y,
  onDone,
}: {
  x: number;
  y: number;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 520);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const ticks = [
    { x1: 8, y1: 16, x2: 3, y2: 8 },
    { x1: 11, y1: 14.5, x2: 8, y2: 5.5 },
    { x1: 14, y1: 14.5, x2: 15.5, y2: 5.5 },
    { x1: 16.5, y1: 16, x2: 22, y2: 9 },
  ] as const;

  return (
    <div
      className="cursor-click-burst"
      style={{ left: x, top: y }}
      aria-hidden
    >
      <div className="cursor-click-sparks">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {ticks.map((tick, index) => (
            <line
              key={index}
              className={`spark-tick spark-tick-${index + 1}`}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="var(--accent)"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/** Custom arrow cursor with four sequential tick marks on click. */
export default function CustomCursor() {
  const enabled = useFinePointer();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [pressed, setPressed] = useState(false);
  const [pointing, setPointing] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const removeBurst = useCallback((id: number) => {
    setBursts((current) => current.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor-active");
    let burstSeq = 0;

    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      setPressed(true);
      burstSeq += 1;
      const burst = { id: burstSeq, x: e.clientX, y: e.clientY };
      setBursts((current) => [...current.slice(-5), burst]);
    };

    const onUp = () => setPressed(false);

    const onOver = (e: MouseEvent) => {
      setPointing(e.target instanceof Element && e.target.closest(INTERACTIVE) !== null);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      root.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      setPointing(false);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        className="custom-cursor"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `scale(${pressed ? 0.88 : 1})`,
        }}
        aria-hidden
      >
        {pointing ? (
          // Offset so the fingertip lands where the arrow tip would.
          <div style={{ marginLeft: -2, marginTop: 1 }}>
            <PointerHand />
          </div>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.5 3.2 18.8 12.1l-6.1 1.5 3.6 6.7-2.4 1.3-3.7-6.9-4.1 4.1V3.2Z"
              fill="#fff"
              stroke="#000"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {bursts.map((burst) => (
        <ClickSparks
          key={burst.id}
          x={burst.x}
          y={burst.y}
          onDone={() => removeBurst(burst.id)}
        />
      ))}
    </>
  );
}
