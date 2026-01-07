/* ===============================
   ENTRIXX - MIRROR RENDER (V1)
   =============================== */

import { drawAtom } from "./atom.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// =====================
// CANVAS (DPR FIX)
// =====================
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

// =====================
// TEMP DATA (TEST ONLY)
// x is normalized time position
// =====================
const atoms = [
  { x: 0.48, y: 0.75, hold: 120, market: -160 }
];

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i];

    drawAtom(
      ctx,
      a.x * canvas.width,
      a.y * canvas.height,
      {
        hold: a.hold,
        market: a.market
      },
      i
    );
  }
}

draw();
