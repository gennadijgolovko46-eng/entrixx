// atom.js — trade atom (V1, screen-space)

const ATOM_SIZE = 3;
const TAIL_WIDTH = 1;

const HOLD_OFFSET_X = -2;
const MARKET_OFFSET_X = 2;

const HOLD_COLOR = "#2F6BFF";
const MARKET_COLOR = "#2DBE60";
const ATOM_COLOR = "#000";

const MIN_TAIL = 6;     // px, always visible
const MAX_TAIL = 160;   // px clamp

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function drawAtom(ctx, x, y, trade, index = 0) {
  const jitter = (index % 3 - 1); // -1,0,+1 px

  // --- ATOM (fixed size, NOT time-scaled) ---
  ctx.fillStyle = ATOM_COLOR;
  ctx.fillRect(
    Math.round(x - ATOM_SIZE / 2),
    Math.round(y - ATOM_SIZE / 2),
    ATOM_SIZE,
    ATOM_SIZE
  );

  ctx.lineWidth = TAIL_WIDTH;

  // --- HOLD tail (blue) ---
  if (trade.hold !== 0) {
    const sign = Math.sign(trade.hold);
    const len = clamp(Math.abs(trade.hold), MIN_TAIL, MAX_TAIL);

    ctx.strokeStyle = HOLD_COLOR;
    ctx.beginPath();
    ctx.moveTo(x + HOLD_OFFSET_X + jitter, y);
    ctx.lineTo(x + HOLD_OFFSET_X + jitter, y - sign * len);
    ctx.stroke();
  }

  // --- MARKET tail (green) ---
  if (trade.market !== 0) {
    const sign = Math.sign(trade.market);
    const len = clamp(Math.abs(trade.market), MIN_TAIL, MAX_TAIL);

    ctx.strokeStyle = MARKET_COLOR;
    ctx.beginPath();
    ctx.moveTo(x + MARKET_OFFSET_X + jitter, y);
    ctx.lineTo(x + MARKET_OFFSET_X + jitter, y - sign * len);
    ctx.stroke();
  }
}
