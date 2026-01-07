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

const COLOR_HOLD   = "rgba(50, 100, 230, 0.8)";
const COLOR_MARKET = "rgba(40, 180, 130, 0.85)";

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
function drawAtom(atom, index) {
  const baseX = atom.x * canvas.width;
  const baseY = atom.y * canvas.height;

  const squareTopY = baseY - ATOM_SIZE / 2;

  const shift = (index % 2 === 0 ? -0.6 : 0.6);

  ctx.lineWidth = TAIL_WIDTH;

  // HOLD
  ctx.strokeStyle = COLOR_HOLD;
  ctx.beginPath();
  ctx.moveTo(baseX - ATOM_SIZE / 2 + shift, squareTopY);
  ctx.lineTo(baseX - ATOM_SIZE / 2 + shift, squareTopY - atom.hold);
  ctx.stroke();

  // MARKET
  ctx.strokeStyle = COLOR_MARKET;
  ctx.beginPath();
  ctx.moveTo(baseX + ATOM_SIZE / 2 + shift, squareTopY);
  ctx.lineTo(baseX + ATOM_SIZE / 2 + shift, squareTopY - atom.market);
  ctx.stroke();

  // ATOM
  ctx.fillStyle = ATOM_COLOR;
  ctx.fillRect(
    baseX - ATOM_SIZE / 2,
    baseY - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < atoms.length; i++) {
    drawAtom(atoms[i], i);
  }
}

draw();
