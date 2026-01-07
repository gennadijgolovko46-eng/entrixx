/* ===============================
   ENTRIXX — DENSITY LAYER
   =============================== */

/*
Rules:
- Density is background-only
- No global canvas state pollution
- Drawn BEFORE behavior and atoms
- No numbers, no thresholds
- Breaks on -2 implicitly by gaps
*/

export function drawDensity(ctx, atoms) {
  if (!ctx || !atoms || atoms.length < 2) return;

  ctx.save();

  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineCap = "round";

  ctx.beginPath();

  let prev = null;

  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i];

    // Skip invalid atoms
    if (!a || typeof a.x !== "number" || typeof a.y !== "number") {
      prev = null;
      continue;
    }

    // Break series on hard stop (-2)
    if (a.stop === true) {
      prev = null;
      continue;
    }

    if (!prev) {
      ctx.moveTo(a.x, a.y);
    } else {
      ctx.lineTo(a.x, a.y);
    }

    prev = a;
  }

  ctx.stroke();
  ctx.restore();
}
