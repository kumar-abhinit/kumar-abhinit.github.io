/**
 * Single coordinate system for the viewport grid.
 *
 * The viewport is split into [outer | centre | outer]. The grid is chosen so that:
 *  - both strip boundaries sit on the frame edges (exactly `width * fraction`),
 *  - each outer strip is a whole number of square cells,
 *  - both strips and the vertical rhythm share one cell size.
 *
 * Desktop is 10%, so the centre is an exact multiple of that cell (8 centre
 * cells per outer cell) and every column is the same width. Mobile is 6%.
 * That ratio is 44/3, so centre columns share the leftover and differ from the
 * outer cell by a fraction of a pixel. Strip edges still land on the frame.
 *
 * Tiles, lines and the cursor glow all go through `columnX`, so they cannot
 * drift apart.
 */

export const DESKTOP_QUERY = "(min-width: 768px)";

export interface GridGeometry {
  width: number;
  height: number;
  /** Outer-strip cell size, and the vertical pitch, in CSS pixels. */
  cell: number;
  /**
   * Horizontal pitch of centre columns. Equals `cell` when the outer fraction
   * divides evenly (desktop 10%).
   */
  innerCell: number;
  /** Cells across each outer strip. */
  outerCells: number;
  /** Cells across the centre container. */
  innerCells: number;
  /** Cells across the full viewport width. */
  totalCols: number;
  /** Rows needed to cover the viewport height. */
  rows: number;
  /** x of the left strip boundary. */
  left: number;
  /** x of the right strip boundary. */
  right: number;
}

/**
 * Fraction of the viewport width taken by each outer strip.
 * Mirrors `--outer` in globals.css: 6% below 768px, 10% from 768px up.
 */
export function outerFraction(desktop: boolean): number {
  return desktop ? 0.1 : 0.06;
}

export function getGridGeometry(
  width: number,
  height: number,
  desktop: boolean,
): GridGeometry {
  const fraction = outerFraction(desktop);
  const outer = width * fraction;
  const targetCell = desktop ? 60 : 24;
  const outerCells = Math.max(1, Math.round(outer / targetCell));
  const cell = outer / outerCells;
  const left = outer;
  const right = width - outer;
  const innerCells = Math.max(1, Math.round((right - left) / cell));
  const innerCell = (right - left) / innerCells;
  const totalCols = innerCells + outerCells * 2;

  return {
    width,
    height,
    cell,
    innerCell,
    outerCells,
    innerCells,
    totalCols,
    rows: Math.ceil(height / cell) + 1,
    left,
    right,
  };
}

/** Left edge of column `col`. Column `totalCols` is the right edge of the viewport. */
export function columnX(geo: GridGeometry, col: number): number {
  if (col <= geo.outerCells) return col * geo.cell;
  const rightStart = geo.outerCells + geo.innerCells;
  if (col >= rightStart) return geo.right + (col - rightStart) * geo.cell;
  return geo.left + (col - geo.outerCells) * geo.innerCell;
}

/** Width of column `col`. Outer strips use `cell`; the centre uses `innerCell`. */
export function columnWidth(geo: GridGeometry, col: number): number {
  const rightStart = geo.outerCells + geo.innerCells;
  if (col < geo.outerCells || col >= rightStart) return geo.cell;
  return geo.innerCell;
}

/** Column containing the CSS x coordinate, clamped to the grid. */
export function columnAt(geo: GridGeometry, x: number): number {
  const rightStart = geo.outerCells + geo.innerCells;
  let col: number;
  if (x < geo.left) col = Math.floor(x / geo.cell);
  else if (x >= geo.right) col = rightStart + Math.floor((x - geo.right) / geo.cell);
  else col = geo.outerCells + Math.floor((x - geo.left) / geo.innerCell);
  if (col < 0) return 0;
  if (col > geo.totalCols - 1) return geo.totalCols - 1;
  return col;
}
