/* ===============================
   ENTRIXX — Mirror main
   =============================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

/* CONFIG */
const ATOM_SIZE = 6;
const HOLD_SCALE = 6;
const MARKET_SCALE = 6;
const MIN_TAIL = 6;

/* DATA */
const atoms = [
  { x: 0.42, y: 0.70, hold: 12, market: 18 },
  { x: 0.50, y: 0.71, hold: 8,  market: 10 },
  { x: 0.58, y: 0.70, hold: 16, market: 22 }
];

function scale(v, k) {
  if (v === 0) return 0;
  const abs = Math.max(Math.abs(v) * k, MIN_TAIL);
  return abs * Math.sign(v);
}

function drawAtom(a) {
  const x = a.x * canvas.width;
  const y = a.y * canvas.height;

  const hold = scale(a.hold, HOLD_SCALE);
  const market = scale(a.market, MARKET_SCALE);

  ctx.lineWidth = 1.5;

  ctx.strokeStyle = "rgba(40,90,255,0.75)";
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - hold);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,160,80,0.75)";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - market);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fillRect(
    x - ATOM_SIZE / 2,
    y - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  atoms.forEach(drawAtom);
  requestAnimationFrame(render);
}

render();
