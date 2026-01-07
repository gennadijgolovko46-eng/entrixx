/* ===============================
   ENTRIXX — DENSITY LAYER
   =============================== */

const DENSITY_MAX_GAP = 15 * 60 * 1000; // 15 minutes
const DENSITY_BASE_WIDTH = 1;
const DENSITY_MAX_WIDTH = 4;

function drawDensity(ctx, atoms) {
  if (!atoms || atoms.length < 2) return;

  ctx.save();
  ctx.strokeStyle = "rgba(120,120,120,0.6)";
  ctx.lineCap = "round";

  for (let i = 1; i < atoms.length; i++) {
    const a = atoms[i - 1];
    const b = atoms[i];

    if (a.break === true || b.break === true) continue;

    const dt = Math.abs(b.time - a.time);
    if (dt > DENSITY_MAX_GAP) continue;

    const t = Math.max(0, 1 - dt / DENSITY_MAX_GAP);
    const width =
      DENSITY_BASE_WIDTH +
      t * (DENSITY_MAX_WIDTH - DENSITY_BASE_WIDTH);

    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
}

window.drawDensity = drawDensity;
