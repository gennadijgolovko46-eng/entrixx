/* ===============================
   ENTRIXX — MAIN
   =============================== */

"use strict";

/* ===== CANVAS ===== */
const canvas = document.getElementById("canvas");
if (!canvas) {
  throw new Error("Canvas not found");
}
const ctx = canvas.getContext("2d");

/* ===== RESIZE ===== */
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

/* ===== CONFIG ===== */
const ATOM_SIZE = 6;
const TAIL_SCALE = 2.2;
const MIN_TAIL = 6;

/* ===== SAMPLE DATA (TEMP) ===== */
const atoms = [
  { x: 0.32, y: 0.62, hold: 3, market: 18 },
  { x: 0.50, y: 0.63, hold: 1, market: 10 },
  { x: 0.68, y: 0.62, hold: 4, market: 22 }
];

/* ===== HELPERS ===== */
function scaleTail(v) {
  if (!v) return 0;
  const abs = Math.max(Math.abs(v) * TAIL_SCALE, MIN_TAIL);
  return abs * Math.sign(v);
}

/* ===== DRAW ATOM ===== */
function drawAtom(a) {
  const x = a.x * canvas.width;
  const y = a.y * canvas.height;

  const hold = scaleTail(a.hold);
  const market = scaleTail(a.market);

  ctx.lineWidth = 2.5;

  /* HOLD — BLUE */
  ctx.strokeStyle = "rgba(40,90,255,1)";
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - hold);
  ctx.stroke();

  /* MARKET — GREEN */
  ctx.strokeStyle = "rgba(0,160,80,1)";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - market);
  ctx.stroke();

  /* BODY */
  ctx.fillStyle = "#000";
  ctx.fillRect(
    x - ATOM_SIZE / 2,
    y - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );
}

/* ===== RENDER LOOP ===== */
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < atoms.length; i++) {
    drawAtom(atoms[i]);
  }

  requestAnimationFrame(render);
}

render();
