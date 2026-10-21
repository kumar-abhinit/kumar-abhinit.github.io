import type { GridGeometry } from "@/lib/grid-geometry";

/**
 * Colours the grid is drawn with. Read from CSS custom properties (`--ink-rgb`,
 * `--accent-rgb`, `--grid-boost`, `--socket-alpha`) so the canvas follows the active theme.
 */
export interface GridPalette {
  /** "r,g,b" of the line / tile colour (white on dark, deep slate on light). */
  ink: string;
  /** "r,g,b" of the accent used by the cursor glow. */
  accent: string;
  /** Multiplier on ink alphas; light backgrounds need a little more to read. */
  boost: number;
  /** Opacity of the dark socket left behind a raised cell. */
  socketAlpha: number;
}

export const DARK_PALETTE: GridPalette = {
  ink: "255,255,255",
  accent: "96,165,250",
  boost: 1,
  socketAlpha: 0.35,
};

/** Reads the active theme's palette from the root element, falling back to dark. */
export function readPalette(): GridPalette {
  if (typeof document === "undefined") return DARK_PALETTE;
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim();
  const number = (name: string, fallback: number) => {
    const parsed = Number.parseFloat(read(name));
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return {
    ink: read("--ink-rgb") || DARK_PALETTE.ink,
    accent: read("--accent-rgb") || DARK_PALETTE.accent,
    boost: number("--grid-boost", DARK_PALETTE.boost),
    socketAlpha: number("--socket-alpha", DARK_PALETTE.socketAlpha),
  };
}

/** Scales an alpha by the palette boost, capped at 1. */
function tone(palette: GridPalette, alpha: number): number {
  return Math.min(1, alpha * palette.boost);
}

/** Dash pattern shared by base lines and their cursor highlight, so they overlay exactly. */
const DASH = [1.5, 4.5];

/** How far (in cells) the cursor illumination, and the pop-out of cells, reaches. */
export const GLOW_RADIUS_CELLS = 3.2;

/** Click ripple: how many cells out the wave travels before it dies. */
const RIPPLE_REACH_CELLS = 3;

/** Click ripple duration in ms. ~3 cells per second keeps the same medium pace. */
export const RIPPLE_DURATION = 1000;

/** Cells near the pointer pop out by at most this many px (kept deliberately small). */
const RISE_PX = 4.5;

/** Stable key for a tile, shared by the hover state and the renderer. */
export function tileKey(col: number, row: number): number {
  return row * 10000 + col;
}

export interface PointerGlow {
  x: number;
  y: number;
  /** 0 (off) to 1 (full). */
  strength: number;
}

export interface GridRipple {
  x: number;
  y: number;
  startedAt: number;
}

export interface DrawState {
  /** Outer-strip reveal progress, 0 to 1. */
  reveal: number;
  glow: PointerGlow | null;
  ripples: readonly GridRipple[];
  /** Per-cell pop-out near the pointer, 0 to 1, keyed by `tileKey`. Any cell can appear. */
  lifts: ReadonlyMap<number, number>;
  /** Opacity of the raised cells, 0 to 1. Lowered over text so it stays readable. */
  liftOpacity: number;
  now: number;
  palette: GridPalette;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Deterministic pseudo-random value in [0, 1) for a tile. */
export function tileNoise(col: number, row: number): number {
  let h = (Math.imul(col + 1, 374761393) + Math.imul(row + 1, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Snap to a half pixel so 1px lines stay crisp. */
function crisp(value: number): number {
  return Math.round(value) + 0.5;
}

/**
 * A slightly raised tile: the top face slides up-left and two thin side faces
 * connect it back to the grid, which reads as a small extrusion.
 */
function drawRaisedTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  lift: number,
  palette: GridPalette,
) {
  const rise = lift * RISE_PX;
  const tx = x - rise;
  const ty = y - rise;

  // Right face.
  ctx.fillStyle = `rgba(${palette.ink},${tone(palette, lift * 0.1).toFixed(4)})`;
  ctx.beginPath();
  ctx.moveTo(tx + size, ty);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(tx + size, ty + size);
  ctx.closePath();
  ctx.fill();

  // Bottom face, a touch dimmer than the right one.
  ctx.fillStyle = `rgba(${palette.ink},${tone(palette, lift * 0.055).toFixed(4)})`;
  ctx.beginPath();
  ctx.moveTo(tx, ty + size);
  ctx.lineTo(tx + size, ty + size);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();

  // Top face with a faint accent edge.
  ctx.fillStyle = `rgba(${palette.ink},${tone(palette, lift * 0.12).toFixed(4)})`;
  ctx.fillRect(tx, ty, size, size);
  ctx.strokeStyle = `rgba(${palette.accent},${(lift * 0.45).toFixed(4)})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(tx + 0.5, ty + 0.5, size - 1, size - 1);
}

/** Cells that follow the pointer pop out as small 3D blocks, above lines and glow. */
function drawRaisedCells(
  ctx: CanvasRenderingContext2D,
  geo: GridGeometry,
  lifts: ReadonlyMap<number, number>,
  palette: GridPalette,
  opacity: number,
) {
  if (lifts.size === 0 || opacity <= 0.005) return;
  const { cell } = geo;
  const inset = 1.5;
  const size = cell - inset * 2;
  if (size <= 0) return;

  // Lowest first so the highest cells sit on top of their neighbours.
  const entries = [...lifts].filter(([, lift]) => lift > 0.005).sort((a, b) => a[1] - b[1]);
  ctx.save();
  ctx.globalAlpha = opacity;
  for (const [key, lift] of entries) {
    const col = key % 10000;
    const row = Math.floor(key / 10000);
    const x = col * cell + inset;
    const y = row * cell + inset;

    // The empty socket the block rose out of.
    ctx.fillStyle = `rgba(0,0,0,${(lift * palette.socketAlpha).toFixed(3)})`;
    ctx.fillRect(x, y, size, size);
    drawRaisedTile(ctx, x, y, size, lift, palette);
  }
  ctx.restore();
}

function drawTiles(
  ctx: CanvasRenderingContext2D,
  geo: GridGeometry,
  reveal: number,
  palette: GridPalette,
) {
  const { cell, outerCells, innerCells, totalCols, rows } = geo;
  const lead = reveal * (rows + 6);
  const rightStart = outerCells + innerCells;

  for (let col = 0; col < totalCols; col += 1) {
    const isOuter = col < outerCells || col >= rightStart;
    if (!isOuter) continue;

    for (let row = 0; row < rows; row += 1) {
      const noise = tileNoise(col, row);
      const t = clamp01((lead - row - noise * 2.5) / 4);
      if (t <= 0) continue;

      const eased = easeOutCubic(t);
      const base = 0.01 + noise * 0.026;
      // A faint leading edge while the tile is still arriving.
      const alpha = base * eased + 0.035 * Math.sin(Math.PI * t) * (0.5 + noise * 0.5);
      const inset = 1.5 + (1 - eased) * cell * 0.3;
      const size = cell - inset * 2;
      if (size <= 0) continue;

      const x = col * cell + inset;
      const y = row * cell + inset;
      ctx.fillStyle = `rgba(${palette.ink},${tone(palette, alpha).toFixed(4)})`;
      ctx.fillRect(x, y, size, size);
    }
  }
}

function strokeSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashOffset: number,
) {
  ctx.setLineDash(DASH);
  ctx.lineDashOffset = dashOffset;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawLines(ctx: CanvasRenderingContext2D, geo: GridGeometry, palette: GridPalette) {
  const { cell, outerCells, innerCells, totalCols, rows, width, height, left, right } = geo;
  const rightCol = outerCells + innerCells;
  const outerAlpha = tone(palette, 0.085);
  const centreAlpha = tone(palette, 0.05);
  const ink = palette.ink;

  ctx.lineWidth = 1;

  // Horizontal lines run edge to edge. Three segments only change brightness;
  // the dash phase is the absolute x, so the pattern is continuous across them.
  for (let row = 1; row < rows; row += 1) {
    const y = crisp(row * cell);
    const segments: Array<[number, number, number]> = [
      [0, left, outerAlpha],
      [left, right, centreAlpha],
      [right, width, outerAlpha],
    ];
    for (const [x1, x2, alpha] of segments) {
      ctx.strokeStyle = `rgba(${ink},${alpha})`;
      strokeSegment(ctx, x1, y, x2, y, x1);
    }
  }

  // Vertical lines. The two strip boundaries are solid and a little stronger.
  for (let col = 1; col < totalCols; col += 1) {
    const x = crisp(col * cell);
    const isBoundary = col === outerCells || col === rightCol;
    if (isBoundary) {
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(${ink},${tone(palette, 0.2)})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      continue;
    }
    const inCentre = col > outerCells && col < rightCol;
    ctx.strokeStyle = `rgba(${ink},${inCentre ? centreAlpha : outerAlpha})`;
    strokeSegment(ctx, x, 0, x, height, 0);
  }

  // Intersections: barely visible at rest.
  ctx.setLineDash([]);
  ctx.fillStyle = `rgba(${ink},${tone(palette, 0.12)})`;
  ctx.beginPath();
  for (let col = 1; col < totalCols; col += 1) {
    const x = crisp(col * cell);
    for (let row = 1; row < rows; row += 1) {
      ctx.rect(x - 1.5, crisp(row * cell) - 1.5, 2, 2);
    }
  }
  ctx.fill();
}

/**
 * A click launches a travelling band through the shared grid. Every cell reacts
 * when the band reaches its centre. The wave is local: it only travels
 * RIPPLE_REACH_CELLS cells out and fades as it goes, so only the squares around
 * the click ever light up.
 */
function drawRipples(
  ctx: CanvasRenderingContext2D,
  geo: GridGeometry,
  ripples: readonly GridRipple[],
  now: number,
  palette: GridPalette,
) {
  const { cell, totalCols, rows } = geo;
  const maxRadius = cell * RIPPLE_REACH_CELLS;
  const band = cell * 1.25;

  for (const ripple of ripples) {
    const progress = clamp01((now - ripple.startedAt) / RIPPLE_DURATION);
    // Gentle ease-out: steady expansion that only slows near the end.
    const radius = (1 - (1 - progress) * (1 - progress)) * maxRadius;
    const life = 1 - progress;

    // Only visit cells the wave can touch.
    const reach = maxRadius + band;
    const minCol = Math.max(0, Math.floor((ripple.x - reach) / cell));
    const maxCol = Math.min(totalCols - 1, Math.ceil((ripple.x + reach) / cell));
    const minRow = Math.max(0, Math.floor((ripple.y - reach) / cell));
    const maxRow = Math.min(rows - 1, Math.ceil((ripple.y + reach) / cell));

    for (let col = minCol; col <= maxCol; col += 1) {
      const cx = (col + 0.5) * cell;
      for (let row = minRow; row <= maxRow; row += 1) {
        const cy = (row + 0.5) * cell;
        const distance = Math.hypot(cx - ripple.x, cy - ripple.y);
        if (distance > maxRadius) continue;
        const wave = 1 - Math.min(1, Math.abs(distance - radius) / band);
        if (wave <= 0) continue;

        const easedWave = wave * wave;
        // Strongest next to the click, tapering to nothing at the edge.
        const proximity = 1 - distance / maxRadius;
        const alpha = easedWave * life * (0.06 + proximity * 0.12);
        const inset = 2 + (1 - easedWave) * cell * 0.16;
        const size = cell - inset * 2;
        if (size <= 0) continue;

        ctx.fillStyle = `rgba(${palette.ink},${tone(palette, alpha).toFixed(3)})`;
        ctx.fillRect(col * cell + inset, row * cell + inset, size, size);
      }
    }
  }
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  geo: GridGeometry,
  glow: PointerGlow,
  palette: GridPalette,
) {
  const ACCENT = palette.accent;
  const { cell, totalCols, rows, width, height } = geo;
  const radius = cell * GLOW_RADIUS_CELLS;
  const { x: px, y: py, strength } = glow;
  const minCol = Math.max(1, Math.floor((px - radius) / cell));
  const maxCol = Math.min(totalCols - 1, Math.ceil((px + radius) / cell));
  const minRow = Math.max(1, Math.floor((py - radius) / cell));
  const maxRow = Math.min(rows - 1, Math.ceil((py + radius) / cell));

  ctx.lineWidth = 1;

  // Horizontal segments, fading out along their length.
  const xStart = Math.max(0, px - radius);
  const xEnd = Math.min(width, px + radius);
  for (let row = minRow; row <= maxRow; row += 1) {
    const dy = Math.abs(row * cell - py);
    if (dy >= radius) continue;
    const a = strength * 0.34 * Math.pow(1 - dy / radius, 1.5);
    const gradient = ctx.createLinearGradient(px - radius, 0, px + radius, 0);
    gradient.addColorStop(0, `rgba(${ACCENT},0)`);
    gradient.addColorStop(0.5, `rgba(${ACCENT},${a.toFixed(3)})`);
    gradient.addColorStop(1, `rgba(${ACCENT},0)`);
    ctx.strokeStyle = gradient;
    strokeSegment(ctx, xStart, crisp(row * cell), xEnd, crisp(row * cell), xStart);
  }

  // Vertical segments.
  const yStart = Math.max(0, py - radius);
  const yEnd = Math.min(height, py + radius);
  for (let col = minCol; col <= maxCol; col += 1) {
    const dx = Math.abs(col * cell - px);
    if (dx >= radius) continue;
    const a = strength * 0.34 * Math.pow(1 - dx / radius, 1.5);
    const gradient = ctx.createLinearGradient(0, py - radius, 0, py + radius);
    gradient.addColorStop(0, `rgba(${ACCENT},0)`);
    gradient.addColorStop(0.5, `rgba(${ACCENT},${a.toFixed(3)})`);
    gradient.addColorStop(1, `rgba(${ACCENT},0)`);
    ctx.strokeStyle = gradient;
    strokeSegment(ctx, crisp(col * cell), yStart, crisp(col * cell), yEnd, yStart);
  }

  // Intersections close to the cursor.
  ctx.setLineDash([]);
  for (let col = minCol; col <= maxCol; col += 1) {
    for (let row = minRow; row <= maxRow; row += 1) {
      const d = Math.hypot(col * cell - px, row * cell - py);
      if (d >= radius) continue;
      const t = 1 - d / radius;
      ctx.fillStyle = `rgba(${ACCENT},${(strength * t * t * 0.6).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(crisp(col * cell), crisp(row * cell), 1.2 + t * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  geo: GridGeometry,
  state: DrawState,
): void {
  ctx.clearRect(0, 0, geo.width, geo.height);
  drawTiles(ctx, geo, state.reveal, state.palette);
  drawRipples(ctx, geo, state.ripples, state.now, state.palette);
  drawLines(ctx, geo, state.palette);
  if (state.glow && state.glow.strength > 0.004) {
    drawGlow(ctx, geo, state.glow, state.palette);
  }
  drawRaisedCells(ctx, geo, state.lifts, state.palette, state.liftOpacity);
  ctx.setLineDash([]);
}
