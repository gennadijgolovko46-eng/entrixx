// atom.js — single trade atom (V1)

const ATOM_WIDTH = 3;
const ATOM_HEIGHT = 3;
const HOLD_OFFSET_X = -2;
const MARKET_OFFSET_X = 2;
const TAIL_WIDTH = 1;

const HOLD_COLOR = "#2F6BFF";
const MARKET_COLOR = "#2DBE60";
const ATOM_COLOR = "#000";

export function drawAtom(ctx, x, y, trade, index = 0) {
  const jitter = (index % 3 - 1); // -1, 0, +1 px

  ctx.fillStyle = ATOM_COLOR;
  ctx.fillRect(
    Math.round(x - ATOM_WIDTH / 2),
    Math.round(y - ATOM_HEIGHT / 2),
    ATOM_WIDTH,
    ATOM_HEIGHT
  );

  ctx.lineWidth = TAIL_WIDTH;

  if (trade.hold !== 0) {
    ctx.strokeStyle = HOLD_COLOR;
    ctx.beginPath();
    ctx.moveTo(x + HOLD_OFFSET_X + jitter, y);
    ctx.lineTo(x + HOLD_OFFSET_X + jitter, y - trade.hold);
    ctx.stroke();
  }

  if (trade.market !== 0) {
    ctx.strokeStyle = MARKET_COLOR;
    ctx.beginPath();
    ctx.moveTo(x + MARKET_OFFSET_X + jitter, y);
    ctx.lineTo(x + MARKET_OFFSET_X + jitter, y - trade.market);
    ctx.stroke();
  }
}
