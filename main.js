/* ===============================
   ENTRIXX - MIRROR MAIN (V1)
   =============================== */

import { drawAtom } from "./atom.js";

// =====================
// CANVAS
// =====================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width  = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// =====================
// FIXED BASELINE (CRITICAL)
// =====================
// Y IS NOT TIME. EVER.
const BASELINE_Y = () => Math.round(window.innerHeight * 0.5);

// =====================
// TEST DATA (TEMP)
// time affects X ONLY
// =====================
const trades = [
  { t: 0.25, hold: 120,  market: -160 },
  { t: 0.50, hold: -20,  market: 130  },
  { t: 0.75, hold: 5,    market: -190 }
];

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const y = BASELINE_Y(); // <<<<<< ONLY HERE Y COMES FROM

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];

    // X is time (normalized 0..1)
    const x = Math.round(trade.t * window.innerWidth);

    drawAtom(ctx, x, y, trade, i);
  }
}

// =====================
// RENDER ONCE
// =====================
draw();
