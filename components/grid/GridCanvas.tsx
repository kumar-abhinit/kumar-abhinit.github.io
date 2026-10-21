"use client";

import { useEffect, useRef } from "react";
import { DESKTOP_QUERY, getGridGeometry, type GridGeometry } from "@/lib/grid-geometry";
import { getReveal, subscribeReveal } from "@/lib/reveal-store";
import {
  drawGrid,
  readPalette,
  RIPPLE_DURATION,
  tileKey,
  tileNoise,
  type GridRipple,
} from "./draw";

/** Pointer easing per frame (position / strength). */
const POSITION_EASE = 0.2;
const STRENGTH_EASE = 0.12;

/** Per-frame easing of each cell's pop-out, so blocks rise and settle softly. */
const LIFT_EASE = 0.18;

/** Pop-out reach in cells at full movement. */
const MAX_POP_CELLS = 4;

/** Reach kept while the mouse is still (cells). Moving can expand up to MAX_POP_CELLS. */
const IDLE_POP_CELLS = 2.5;

/** Activity level that maps to IDLE_POP_CELLS via `reach = MAX_POP_CELLS * activity`. */
const ACTIVITY_IDLE = IDLE_POP_CELLS / MAX_POP_CELLS;

/** Pointer travel (in cells) that takes the movement activity from idle to 1. */
const ACTIVITY_TRAVEL_CELLS = 2;

/** Idle time before activity starts to decay toward the idle floor. */
const ACTIVITY_HOLD_MS = 90;
const ACTIVITY_DECAY = 0.955;

/** Components that already carry text; the raised cells fade while the pointer is over them. */
const TEXT_ZONE = ".hero, .section, .profile";

/** Raised-cell opacity over text (1 = untouched) and its per-frame easing. */
const TEXT_LIFT_OPACITY = 0.28;
const OPACITY_EASE = 0.16;

/**
 * One full-viewport canvas that draws the dotted grid, the outer tile strips and
 * the cursor illumination from a single shared geometry.
 */
export default function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");

    let geometry: GridGeometry | null = null;
    let frame = 0;
    let pointerBound = false;
    let ripples: GridRipple[] = [];
    const lifts = new Map<number, number>();

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      strength: 0,
      target: 0,
      seen: false,
      /** ACTIVITY_IDLE (still) to 1 (moving): how far the pop-out spreads. */
      activity: 0,
      lastMoveAt: 0,
      /** Eased opacity of the raised cells, and the value it is heading to. */
      liftOpacity: 1,
      liftOpacityTarget: 1,
    };

    /** Over a text component the raised cells step back so the copy stays legible. */
    const setOverText = (element: Element | null) => {
      const overText = element?.closest(TEXT_ZONE) != null;
      pointer.liftOpacityTarget = overText ? TEXT_LIFT_OPACITY : 1;
    };

    const currentReveal = () => (reduceQuery.matches ? 1 : getReveal());

    // Theme colours come from CSS variables; re-read whenever the theme changes.
    let palette = readPalette();

    const render = () => {
      if (!geometry) return;
      const glowing = pointer.seen && pointer.strength > 0;
      drawGrid(ctx, geometry, {
        palette,
        reveal: currentReveal(),
        glow: glowing ? { x: pointer.x, y: pointer.y, strength: pointer.strength } : null,
        ripples,
        lifts,
        liftOpacity: pointer.liftOpacity,
        now: performance.now(),
      });
    };

    /**
     * The cell under the pointer always pops out. While the mouse moves, nearby
     * cells join in up to MAX_POP_CELLS away; each cell has its own noisy reach
     * and height, so the patch is ragged instead of a neat diamond. When the mouse
     * stops, activity decays down to IDLE_POP_CELLS (~2.5 cells), not to zero.
     * Returns true while still moving.
     */
    const updateLifts = (): boolean => {
      const targets = new Map<number, number>();

      if (geometry && pointer.seen && pointer.target > 0) {
        const { cell, totalCols, rows } = geometry;
        const reach = MAX_POP_CELLS * pointer.activity;
        const span = Math.ceil(reach) + 1;
        const centreCol = Math.floor(pointer.x / cell);
        const centreRow = Math.floor(pointer.y / cell);
        const minCol = Math.max(0, centreCol - span);
        const maxCol = Math.min(totalCols - 1, centreCol + span);
        const minRow = Math.max(0, centreRow - span);
        const maxRow = Math.min(rows - 1, centreRow + span);

        for (let col = minCol; col <= maxCol; col += 1) {
          for (let row = minRow; row <= maxRow; row += 1) {
            const distance =
              Math.hypot((col + 0.5) * cell - pointer.x, (row + 0.5) * cell - pointer.y) / cell;
            // Each cell reaches between 50% and 100% of the current spread.
            const cellReach = reach * (0.5 + 0.5 * tileNoise(col, row));
            if (distance >= cellReach) continue;
            const falloff = Math.pow(1 - distance / cellReach, 1.3);
            // Independent noise so heights differ between neighbours too.
            const height = 0.65 + 0.35 * tileNoise(col + 53, row + 17);
            targets.set(tileKey(col, row), falloff * height);
          }
        }

        if (
          centreCol >= 0 && centreCol < totalCols &&
          centreRow >= 0 && centreRow < rows
        ) {
          targets.set(tileKey(centreCol, centreRow), 1);
        }
      }

      for (const key of targets.keys()) {
        if (!lifts.has(key)) lifts.set(key, 0);
      }

      let moving = false;
      for (const [key, value] of lifts) {
        const target = targets.get(key) ?? 0;
        const next = value + (target - value) * LIFT_EASE;
        if (target === 0 && next < 0.01) {
          lifts.delete(key);
          continue;
        }
        lifts.set(key, Math.abs(target - next) < 0.003 ? target : next);
        if (Math.abs(target - next) >= 0.003) moving = true;
      }
      return moving;
    };

    const tick = () => {
      frame = 0;

      pointer.x += (pointer.targetX - pointer.x) * POSITION_EASE;
      pointer.y += (pointer.targetY - pointer.y) * POSITION_EASE;
      pointer.strength += (pointer.target - pointer.strength) * STRENGTH_EASE;

      const settledPosition =
        Math.abs(pointer.targetX - pointer.x) < 0.3 && Math.abs(pointer.targetY - pointer.y) < 0.3;
      const settledStrength = Math.abs(pointer.target - pointer.strength) < 0.004;
      if (settledPosition) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }
      if (settledStrength) pointer.strength = pointer.target;

      pointer.liftOpacity += (pointer.liftOpacityTarget - pointer.liftOpacity) * OPACITY_EASE;
      const settledOpacity = Math.abs(pointer.liftOpacityTarget - pointer.liftOpacity) < 0.005;
      if (settledOpacity) pointer.liftOpacity = pointer.liftOpacityTarget;

      const now = performance.now();
      ripples = ripples.filter((ripple) => now - ripple.startedAt < RIPPLE_DURATION);

      // While the pointer is on the page, still settles at ~2.5 cells; leaving
      // the window drains all the way to 0.
      if (now - pointer.lastMoveAt > ACTIVITY_HOLD_MS) {
        if (pointer.target > 0) {
          if (pointer.activity > ACTIVITY_IDLE) {
            pointer.activity = Math.max(ACTIVITY_IDLE, pointer.activity * ACTIVITY_DECAY);
          } else {
            pointer.activity = ACTIVITY_IDLE;
          }
        } else if (pointer.activity > 0) {
          pointer.activity *= ACTIVITY_DECAY;
          if (pointer.activity < 0.01) pointer.activity = 0;
        }
      }

      const liftsMoving = updateLifts();
      render();

      // Keep animating while glow/ripples/lifts are settling, or while activity
      // is still decaying toward the idle floor (or to 0 after leaving).
      const activitySettling =
        (pointer.target > 0 && pointer.activity > ACTIVITY_IDLE + 0.002) ||
        (pointer.target === 0 && pointer.activity > 0);
      if (
        !(settledPosition && settledStrength && settledOpacity) ||
        ripples.length > 0 ||
        liftsMoving ||
        activitySettling
      ) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const requestDraw = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geometry = getGridGeometry(width, height, desktopQuery.matches);
      lifts.clear();
      render();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      setOverText(event.target instanceof Element ? event.target : null);

      // Travel since the last event feeds the movement activity.
      if (pointer.seen) {
        const travel = Math.hypot(event.clientX - pointer.targetX, event.clientY - pointer.targetY);
        const cell = geometry?.cell ?? 60;
        pointer.activity = Math.min(1, pointer.activity + travel / (cell * ACTIVITY_TRAVEL_CELLS));
      }
      pointer.lastMoveAt = performance.now();

      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      if (!pointer.seen) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.seen = true;
        // Parked cursor still shows the idle ~2.5-cell patch.
        pointer.activity = Math.max(pointer.activity, ACTIVITY_IDLE);
      }
      pointer.target = 1;
      requestDraw();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (
        event.pointerType === "touch" ||
        event.button !== 0 ||
        (event.target instanceof Element &&
          event.target.closest("a, button, input, textarea, select, [role='button']"))
      ) {
        return;
      }

      ripples.push({
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
      });
      // Bound the work when clicks overlap rapidly.
      if (ripples.length > 4) ripples = ripples.slice(-4);
      requestDraw();
    };

    const fadeOut = () => {
      pointer.target = 0;
      pointer.liftOpacityTarget = 1;
      requestDraw();
    };

    // Content scrolls under a still pointer, so re-check what is beneath it.
    const onScroll = () => {
      if (!pointer.seen || pointer.target === 0) return;
      setOverText(document.elementFromPoint(pointer.targetX, pointer.targetY));
      requestDraw();
    };

    const bindPointer = () => {
      if (pointerBound) return;
      pointerBound = true;
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true, capture: true });
      document.documentElement.addEventListener("mouseleave", fadeOut);
      window.addEventListener("blur", fadeOut);
    };

    const unbindPointer = () => {
      if (!pointerBound) return;
      pointerBound = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, { capture: true });
      document.documentElement.removeEventListener("mouseleave", fadeOut);
      window.removeEventListener("blur", fadeOut);
      pointer.liftOpacity = 1;
      pointer.liftOpacityTarget = 1;
      pointer.target = 0;
      pointer.strength = 0;
      pointer.activity = 0;
      ripples = [];
      lifts.clear();
    };

    // Pointer effects are off for reduced motion and touch-first devices.
    const syncPointerEffect = () => {
      if (reduceQuery.matches || coarseQuery.matches) unbindPointer();
      else bindPointer();
      render();
    };

    const onGeometryChange = () => resize();

    const onThemeChange = () => {
      palette = readPalette();
      render();
    };
    const schemeQuery = window.matchMedia("(prefers-color-scheme: light)");
    schemeQuery.addEventListener("change", onThemeChange);
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const unsubscribeReveal = subscribeReveal(requestDraw);
    reduceQuery.addEventListener("change", syncPointerEffect);
    coarseQuery.addEventListener("change", syncPointerEffect);
    desktopQuery.addEventListener("change", onGeometryChange);

    syncPointerEffect();
    resize();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      schemeQuery.removeEventListener("change", onThemeChange);
      unsubscribeReveal();
      unbindPointer();
      reduceQuery.removeEventListener("change", syncPointerEffect);
      coarseQuery.removeEventListener("change", syncPointerEffect);
      desktopQuery.removeEventListener("change", onGeometryChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
