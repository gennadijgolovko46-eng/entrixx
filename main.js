// main.js — ENTRIXX V1
// main does NOT draw geometry
// it only places atoms in space

import { drawAtom } from "./atom.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

// =====================
// TEST DATA (TEMP)
// values are PIXELS, not time
// =====================
const testTrade = {
  hold: 60,     // px
  market: -160 // px
};

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const x = Math.round(canvas.width / 2);
  const y = Math.round(canvas.height / 2);

  drawAtom(ctx, x, y, testTrade, 0);
}

draw();
