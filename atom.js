// atom.js

export const MARKET_DURATION_SEC = 8 * 60 * 60; // 8 hours

export function drawAtom(ctx, trade, x, baseY, pxPerSec) {
  const ATOM_SIZE = 4;
  const TAIL_W = 1.2;

  const BLUE = "#2F6BFF";
  const GREEN = "#2DBE60";
  const BLACK = "#000";
  const RED = "#C00000";

  const top = baseY - ATOM_SIZE / 2;
  const bottom = baseY + ATOM_SIZE / 2;

  // ---------- MARKET (always 8h) ----------
  const marketLen = MARKET_DURATION_SEC * pxPerSec;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = TAIL_W;
  ctx.beginPath();
  ctx.moveTo(x + ATOM_SIZE / 2, top);
  ctx.lineTo(x + ATOM_SIZE / 2, top - marketLen);
  ctx.stroke();

  // ---------- USER (blue) ----------
  if (!trade.liquidation) {
    const holdSec = Math.max(trade.exit_time - trade.entry_time, 1);
    const holdLen = Math.min(holdSec * pxPerSec, marketLen);

    ctx.strokeStyle = BLUE;
    ctx.beginPath();
    ctx.moveTo(x - ATOM_SIZE / 2, top);
    ctx.lineTo(x - ATOM_SIZE / 2, top - holdLen);
    ctx.stroke();
  }

  // ---------- ENTRY ----------
  if (trade.liquidation) {
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x - 5, baseY - 5);
    ctx.lineTo(x + 5, baseY + 5);
    ctx.moveTo(x + 5, baseY - 5);
    ctx.lineTo(x - 5, baseY + 5);
    ctx.stroke();
  } else {
    ctx.fillStyle = BLACK;
    ctx.fillRect(
      x - ATOM_SIZE / 2,
      baseY - ATOM_SIZE / 2,
      ATOM_SIZE,
      ATOM_SIZE
    );
  }
}
