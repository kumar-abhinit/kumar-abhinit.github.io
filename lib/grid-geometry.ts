/**
 * Single coordinate system for the viewport grid.
 *
 * The viewport is split into [outer | centre | outer]. The grid is chosen so that:
 *  - both strip boundaries sit exactly on grid lines,
 *  - each outer strip is a whole number of square cells,
 *  - one cell size is shared across all three regions.
 *
 * Tiles, lines and the cursor glow are all derived from this one result, so they
 * cannot drift apart.
 */

export const DESKTOP_QUERY = "(min-width: 768px)";

export interface GridGeometry {
  width: number;
  height: number;
  /** Side of one (square) cell in CSS pixels. */
  cell: number;
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

/** Fraction of the viewport width taken by each outer strip. Mirrors `--outer` in globals.css. */
export function outerFraction(desktop: boolean): number {
  return desktop ? 0.1 : 0.0625;
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
  // inner / outer = (1 - 2f) / f; this is an integer for f = 1/10 (8) and f = 1/16 (14).
  const innerCells = Math.round((outerCells * (1 - 2 * fraction)) / fraction);
  const cell = outer / outerCells;
  const totalCols = innerCells + outerCells * 2;

  return {
    width,
    height,
    cell,
    outerCells,
    innerCells,
    totalCols,
    rows: Math.ceil(height / cell) + 1,
    left: outerCells * cell,
    right: (outerCells + innerCells) * cell,
  };
}
