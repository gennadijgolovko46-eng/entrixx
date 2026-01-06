/* ===============================
   ENTRIXX — MIRROR CORE
   =============================== */

const canvases = [
  document.getElementById('layer1'),
  document.getElementById('layer2'),
  document.getElementById('layer3')
];
const ctxs = canvases.map(c => c.getContext('2d'));

let W = 0;
let H = 0;
let centerX = 0;

/* ===== RESIZE ===== */
function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvases.forEach(c => {
    c.width = W;
    c.height = H;
  });
  centerX = Math.floor(W / 2);
  redraw();
}
window.addEventListener('resize', resize);

/* ===== CLEAR ===== */
function clear() {
  ctxs.forEach(ctx => ctx.clearRect(0, 0, W, H));
}

/* ===== AXIS ===== */
function drawAxis() {
  const ctx = ctxs[0];
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;

  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, H);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

/* ===== MOCK TRADES ===== */
const trades = [
  { y: 200, took: 40, missed: 120 },
  { y: 320, took: 90, missed: 20 },
  { y: 460, took: 30, missed: 160 },
  { y: 610, took: 110, missed: 60 }
];

/* ===== TRADES ===== */
function drawTrades() {
  const ctx = ctxs[1];
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineWidth = 1;

  trades.forEach(t => {
    // точка выхода
    ctx.beginPath();
    ctx.arc(centerX, t.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // хвост "взял"
    ctx.beginPath();
    ctx.moveTo(centerX, t.y);
    ctx.lineTo(centerX + t.took, t.y);
    ctx.stroke();

    // хвост "упустил" (пунктир)
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, t.y);
    ctx.lineTo(centerX + t.missed, t.y);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

/* ===== REDRAW ===== */
function redraw() {
  clear();
  drawAxis();
  drawTrades();
}

/* ===== INIT ===== */
resize();
