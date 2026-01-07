/* ===============================
   ENTRIXX - MIRROR RENDER (V1)
   =============================== */

/*
RULES (FIXED):
- Atom is a square
- Tails start only from the top edge of the square
- No tails from center
- Single renderer only
*/

// =====================
// CANVAS SETUP
// =====================
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

const TAIL_WIDTH = 1.5;
const TAIL_OFFSET_X = 5;

const COLOR_HOLD   = "rgba(70,120,255,0.45)";
const COLOR_MARKET = "rgba(80,170,130,0.45)";

const ATOM_COLOR = "#000";

// =====================
// DATA (TEMP)
// =====================
const atoms = [
  { x: 0.25, y: 0.75, hold: 120, market: 160 },
  { x: 0.50, y: 0.75, hold: 90,  market: 130 },
  { x: 0.75, y: 0.75, hold: 150, market: 190 }
];

// =====================
// DRAW ATOM
// =====================
function drawAtom(atom) {
  const baseX = atom.x * canvas.width;
  const baseY = atom.y * canvas.height;

  const squareTopY = baseY - ATOM_SIZE / 2;

  // HOLD tail (left)
  ctx.strokeStyle = COLOR_HOLD;
  ctx.lineWidth = TAIL_WIDTH;
  ctx.beginPath();
  ctx.moveTo(baseX - TAIL_OFFSET_X, squareTopY);
  ctx.lineTo(baseX - TAIL_OFFSET_X, squareTopY - atom.hold);
  ctx.stroke();

  // MARKET tail (right)
  ctx.strokeStyle = COLOR_MARKET;
  ctx.lineWidth = TAIL_WIDTH;
  ctx.beginPath();
  ctx.moveTo(baseX + TAIL_OFFSET_X, squareTopY);
  ctx.lineTo(baseX + TAIL_OFFSET_X, squareTopY - atom.market);
  ctx.stroke();

  // ATOM body
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
