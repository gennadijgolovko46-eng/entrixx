/* ===============================
   ENTRIXX — MAIN (ASCII ONLY)
   =============================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

/* TEST DATA */
const atoms = [
  { x: 0.30, y: 0.60, hold: 60, market: 120 },
  { x: 0.50, y: 0.60, hold: 40, market: 80 },
  { x: 0.70, y: 0.60, hold: 70, market: 140 }
];

const ATOM_SIZE = 6;

/* DRAW FUNCTIONS */

function drawHold(x, y, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(40,90,255,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - h);
  ctx.stroke();
  ctx.restore();
}

function drawMarket(x, y, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,160,80,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - h);
  ctx.stroke();
  ctx.restore();
}

function drawBody(x, y) {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillRect(
    x - ATOM_SIZE / 2,
    y - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );
  ctx.restore();
}

/* RENDER LOOP */

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  atoms.forEach(a => {
    const x = a.x * canvas.width;
    const y = a.y * canvas.height;

    drawHold(x, y, a.hold);
    drawMarket(x, y, a.market);
    drawBody(x, y);
  });

  requestAnimationFrame(render);
}

render();
