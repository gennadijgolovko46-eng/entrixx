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

const COLOR_HOLD = "rgba(70,120,255,0.45)";
const COLOR_MARKET = "rgba(80,170,130,0.45)";

const TAIL_WIDTH = 1.5;
const TAIL_OFFSET_X = 5;

// =====================
// DATA (demo)
// =====================
const atoms = [
  { x: canvas.width * 0.25, y: canvas.height * 0.75, hold: 120, market: 160 },
  { x: canvas.width * 0.50, y: canvas.height * 0.75, hold: 90,  market: 130 },
  { x: canvas.width * 0.75, y: canvas.height * 0.75, hold: 150, market: 190 }
];

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  atoms.forEach(a => {
    const baseX = a.x;
    const baseY = a.y;

    // top edge of the square — ONLY valid tail start
    const squareTopY = baseY - ATOM_SIZE / 2;

    // HOLD tail (left)
    ctx.strokeStyle = COLOR_HOLD;
    ctx.lineWidth = TAIL_WIDTH;
    ctx.beginPath();
    ctx.moveTo(baseX - TAIL_OFFSET_X, squareTopY);
    ctx.lineTo(baseX - TAIL_OFFSET_X, squareTopY - a.hold);
    ctx.stroke();

    // MARKET tail (right)
    ctx.strokeStyle = COLOR_MARKET;
    ctx.lineWidth = TAIL_WIDTH;
    ctx.beginPath();
    ctx.moveTo(baseX + TAIL_OFFSET_X, squareTopY);
    ctx.lineTo(baseX + TAIL_OFFSET_X, squareTopY - a.market);
    ctx.stroke();

    // ATOM (anchor)
    ctx.fillStyle = "#000";
    ctx.fillRect(
      baseX - ATOM_SIZE / 2,
      baseY - ATOM_SIZE / 2,
      ATOM_SIZE,
      ATOM_SIZE
    );
  });
}

draw();
