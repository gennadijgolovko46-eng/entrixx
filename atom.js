// atom.js — canonical atom (locked)

export const ATOM_SIZE = 2;
export const TAIL_WIDTH = 1.2;
export const MIN_BLUE = 2;
export const MARKET_HEIGHT = 160;

export const COLOR_BLUE  = "#2F6BFF";
export const COLOR_GREEN = "#2DBE60";
export const COLOR_BLACK = "#000";
export const COLOR_RED   = "#D10000";

export function drawLiquidation(ctx, x, y) {
  ctx.strokeStyle = COLOR_RED;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 5);
  ctx.lineTo(x + 5, y + 5);
  ctx.moveTo(x + 5, y - 5);
  ctx.lineTo(x - 5, y + 5);
  ctx.stroke();
}

export function drawAtom(ctx, x, y, a) {
  const top = y - ATOM_SIZE / 2;
  const bottom = y + ATOM_SIZE / 2;

  ctx.lineWidth = TAIL_WIDTH;

  // market (green) — always fixed length
  ctx.strokeStyle = COLOR_GREEN;
  ctx.beginPath();
  ctx.moveTo(x + ATOM_SIZE / 2, a.dir < 0 ? bottom : top);
  ctx.lineTo(
    x + ATOM_SIZE / 2,
    a.dir < 0 ? bottom + MARKET_HEIGHT : top - MARKET_HEIGHT
  );
  ctx.stroke();

  // user (blue)
  if (!a.liquid) {
    const blueLen = Math.max(a.hold, MIN_BLUE);
    ctx.strokeStyle = COLOR_BLUE;
    ctx.beginPath();
    ctx.moveTo(x - ATOM_SIZE / 2, a.dir < 0 ? bottom : top);
    ctx.lineTo(
      x - ATOM_SIZE / 2,
      a.dir < 0 ? bottom + blueLen : top - blueLen
    );
    ctx.stroke();
  }

  // entry point (black square)
  ctx.fillStyle = COLOR_BLACK;
  ctx.fillRect(
    x - ATOM_SIZE / 2,
    y - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );

  // liquidation
  if (a.liquid) drawLiquidation(ctx, x, y);
}
