/* ===============================
   ENTRIXX - MIRROR RENDER (V1)
   =============================== */

import { drawAtom } from "./atom.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// =====================
// CANVAS
// =====================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// =====================
// TEMP DATA (TEST ONLY)
// x, y are normalized (0..1)
// =====================
const atoms = [
  { x: 0.25, y: 0.75, hold: 120,  market: -160 },
  { x: 0.50, y: 0.75, hold: -20,  market: 130  },
  { x: 0.75, y: 0.75, hold: 5,    market: -190 }
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
