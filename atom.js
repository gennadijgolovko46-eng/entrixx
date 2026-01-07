/* ===============================
   ENTRIXX — ATOM (CANONICAL V1)
   =============================== */

/*
Input:
x, y            — screen coordinates (entry point)
entryTime       — timestamp (ms)
exitTime        — timestamp (ms) | null if liquidated
isLiquidation   — boolean
*/

const ATOM_SIZE = 3;
const TAIL_WIDTH = 1;

// time constants
const MARKET_WINDOW_MS = 8 * 60 * 60 * 1000;

// visual scale
const PX_PER_MIN = 1; // fixed scale, calibrated once per UI

// colors
const COLOR_ATOM = "#000";
const COLOR_HOLD = "#2F6BFF";
const COLOR_MARKET = "#2DBE60";
const COLOR_LIQUIDATION = "#000";

export function drawAtom(ctx, x, y, trade) {
  const {
    entryTime,
    exitTime,
    isLiquidation
  } = trade;

  // ---- time lengths ----
  const marketMinutes = MARKET_WINDOW_MS / 60000;
  const marketLenPx = marketMinutes * PX_PER_MIN;

  let holdLenPx = 0;

  if (!isLiquidation && exitTime !== null) {
    const holdMs = Math.max(0, exitTime - entryTime);
    const holdMin = Math.min(holdMs / 60000, marketMinutes);
    holdLenPx = holdMin * PX_PER_MIN;
  }

  ctx.lineWidth = TAIL_WIDTH;

  // ---- GREEN: MARKET (always 8h) ----
  ctx.strokeStyle = COLOR_MARKET;
  ctx.beginPath();
  ctx.moveTo(x + ATOM_SIZE, y);
  ctx.lineTo(x + ATOM_SIZE, y - marketLenPx);
  ctx.stroke();

  // ---- BLUE: HOLD (real time only) ----
  if (!isLiquidation && holdLenPx > 0) {
    ctx.strokeStyle = COLOR_HOLD;
    ctx.beginPath();
    ctx.moveTo(x - ATOM_SIZE, y);
    ctx.lineTo(x - ATOM_SIZE, y - holdLenPx);
    ctx.stroke();
  }

  // ---- ENTRY POINT ----
  if (isLiquidation) {
    drawLiquidationCross(ctx, x, y);
    return;
  }

  ctx.fillStyle = COLOR_ATOM;
  ctx.fillRect(
    Math.round(x - ATOM_SIZE / 2),
    Math.round(y - ATOM_SIZE / 2),
    ATOM_SIZE,
    ATOM_SIZE
  );
}

// ---- liquidation mark ----
function drawLiquidationCross(ctx, x, y) {
  const r = 4;
  ctx.strokeStyle = COLOR_LIQUIDATION;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(x - r, y - r);
  ctx.lineTo(x + r, y + r);
  ctx.moveTo(x + r, y - r);
  ctx.lineTo(x - r, y + r);
  ctx.stroke();
}
