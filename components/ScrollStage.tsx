"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { setReveal } from "@/lib/reveal-store";

/** Viewport heights of scroll over which the hero dissolves into the workspace. */
const HERO_RANGE = 0.8;
/** Viewport heights of scroll over which the outer tiles reveal top to bottom. */
const REVEAL_RANGE = 1.6;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Scroll-state orchestration. Writes `--p` (hero progress) to the stage element
 * and publishes the tile reveal progress. No React state per frame: the CSS and
 * the canvas react to these values directly.
 */
export default function ScrollStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;
    let heroState: "active" | "done" = "active";

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const y = window.scrollY;

      const p = clamp01(y / (viewport * HERO_RANGE));
      stage.style.setProperty("--p", p.toFixed(4));

      // The hero is removed from the tab order / a11y tree once it has faded out.
      const next = p >= 0.42 ? "done" : "active";
      if (next !== heroState) {
        heroState = next;
        stage.dataset.hero = next;
      }

      setReveal(clamp01(y / (viewport * REVEAL_RANGE)));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={stageRef} className="stage" data-hero="active">
      {children}
    </div>
  );
}
