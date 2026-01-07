/* ===============================
   ENTRIXX - MIRROR RENDER (V1)
   =============================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// =====================
// CONFIG
// =====================
const ATOM_SIZE = 6;

const TAIL_WIDTH = 1.2;

const COLOR_HOLD   = "rgba(50,100,230,0.8)";
const COLOR_MARKET = "rgba(40,180,130,0.85)";

const ATOM_COLOR = "#000";

// minimal visible hold (px)
const MIN_HOLD_HEIGHT = 4;

// =====================
// DATA (TEMP)
// Positive = up, Negative = down
// =====================
const atoms = [
  { x: 0.25, y: 0.75, hold: 120,  market: -160 },
  { x: 0.50, y: 0.75, hold: -20,  market: 130  },
  { x: 0.75, y: 0.75, hold: 5,    market: -190 }
];

// =====================
// DRAW ATOM
// =====================
function drawAtom(atom) {
  const baseX = atom.x * canvas.width;
  const baseY = atom.y * canvas.height;

  const squareTopY    = baseY - ATOM_SIZE / 2;
  const squareBottomY = baseY + ATOM_SIZE / 2;

  ctx.lineWidth = TAIL_WIDTH;

  // -------- HOLD (blue) --------
  const holdSign = Math.sign(atom.hold) || 1;
  const holdAbs  = Math.max(Math.abs(atom.hold), MIN_HOLD_HEIGHT);
  const holdEndY =
    holdSign > 0
      ? squareTopY - holdAbs
      : squareBottomY + holdAbs;

  ctx.strokeStyle = COLOR_HOLD;
  ctx.beginPath();
  ctx.moveTo(
    baseX - ATOM_SIZE / 2,
    holdSign > 0 ? squareTopY : squareBottomY
  );
  ctx.lineTo(baseX - ATOM_SIZE / 2, holdEndY);
  ctx.stroke();

  // -------- MARKET (green) --------
  const marketSign = Math.sign(atom.market) || 1;
  const marketAbs  = Math.abs(atom.market);
  const marketEndY =
    marketSign > 0
      ? squareTopY - marketAbs
      : squareBottomY + marketAbs;

  ctx.strokeStyle = COLOR_MARKET;
  ctx.beginPath();
  ctx.moveTo(
    baseX + ATOM_SIZE / 2,
    marketSign > 0 ? squareTopY : squareBottomY
  );
  ctx.lineTo(baseX + ATOM_SIZE / 2, marketEndY);
  ctx.stroke();

  // -------- ATOM --------
  ctx.fillStyle = ATOM_COLOR;
  ctx.fillRect(
    baseX - ATOM_SIZE / 2,
    baseY - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );
}

// =====================
// MAIN DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < atoms.length; i++) {
    drawAtom(atoms[i]);
  }
}

draw();
