// atom.js — single trade atom (V1)
// pixel-locked, no time encoding

const ATOM_PX = 2;            // fixed pixel size, never scaled
const HOLD_OFFSET_X = -2;     // px
const MARKET_OFFSET_X = 2;    // px
const TAIL_WIDTH = 1;

const HOLD_COLOR = "#2F6BFF";
const MARKET_COLOR = "#2DBE60";
const ATOM_COLOR = "#000";

const MIN_HOLD_PX = 4;

export function drawAtom(ctx, x, y, trade, index = 0) {
  const jitter = (index % 3 - 1); // -1, 0, +1 px
  const half = Math.floor(ATOM_PX / 2);

  // ATOM BODY (pure pixel marker, no time meaning)
  ctx.fillStyle = ATOM_COLOR;
  ctx.fillRect(
    Math.round(x) - half,
    Math.round(y) - half,
    ATOM_PX,
    ATOM_PX
  );

  ctx.lineWidth = TAIL_WIDTH;

  // HOLD tail (blue)
  if (trade.hold !== 0) {
    const sign = Math.sign(trade.hold) || 1;
    const len = Math.max(Math.abs(trade.hold), MIN_HOLD_PX);

    ctx.strokeStyle = HOLD_COLOR;
    ctx.beginPath();
    ctx.moveTo(Math.round(x + HOLD_OFFSET_X + jitter), Math.round(y));
    ctx.lineTo(
      Math.round(x + HOLD_OFFSET_X + jitter),
      Math.round(y - sign * len)
    );
    ctx.stroke();
  }

  // MARKET tail (green)
  if (trade.market !== 0) {
    const sign = Math.sign(trade.market) || 1;
    const len = Math.abs(trade.market);

    ctx.strokeStyle = MARKET_COLOR;
    ctx.beginPath();
    ctx.moveTo(Math.round(x + MARKET_OFFSET_X + jitter), Math.round(y));
    ctx.lineTo(
      Math.round(x + MARKET_OFFSET_X + jitter),
      Math.round(y - sign * len)
    );
    ctx.stroke();
  }
}
