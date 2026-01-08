// main.js
import { drawAtom } from "./atom.js";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// -------- TEST REAL DATA --------
const trades = [
  { entry_time: 1704662400, exit_time: 1704664200, liquidation: false },
  { entry_time: 1704664800, exit_time: 1704664815, liquidation: true },
  { entry_time: 1704665400, exit_time: 1704667800, liquidation: false },
  { entry_time: 1704668400, exit_time: 1704670000, liquidation: false }
];

// -------- TIME → X --------
const DAY_SEC = 24 * 60 * 60;
const startDay = trades[0].entry_time - (trades[0].entry_time % DAY_SEC);

function timeToX(t) {
  return ((t - startDay) / DAY_SEC) * W;
}

// -------- SCALE --------
const PX_PER_SEC = 0.015;
const BASE_Y = H * 0.55;

// -------- RENDER --------
function render() {
  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < trades.length; i++) {
    const t = trades[i];
    const x = timeToX(t.entry_time);
    drawAtom(ctx, t, x, BASE_Y, PX_PER_SEC);
  }

  requestAnimationFrame(render);
}
render();
