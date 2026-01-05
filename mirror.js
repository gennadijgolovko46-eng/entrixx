/* ===============================
   ENTRIXX — MIRROR (SOURCE)
   =============================== */

/* ===== CONFIG ===== */
const TIME_SCALE = 0.00005;
const POINT_RADIUS = 2;
const LINE_WIDTH = 1;
const HOLD_SCALE = 0.00004;
const LAYER_GAP = 40;

/* ===== DOM ===== */
const wrap = document.getElementById('wrap');
const timeLabel = document.getElementById('time');
const backBtn = document.getElementById('back');

const canvases = [
  document.getElementById('layer1'),
  document.getElementById('layer2'),
  document.getElementById('layer3')
];
const ctxs = canvases.map(c => c.getContext('2d'));

/* ===== SIZE ===== */
let width = 0;
let height = 0;

function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;
  canvases.forEach(c => {
    c.width = width;
    c.height = height;
  });
  renderAll();
}
window.addEventListener('resize', resize);

/* ===== STATE ===== */
let decisions = [];
let CENTER_TIME = 0;

/* ===== URL ===== */
const params = new URLSearchParams(window.location.search);
const USER_ID = params.get('id');

/* ===== SOURCE ===== */
async function loadSource() {
  try {
    const res = await fetch(`/api/mirror?id=${USER_ID}`, {
      cache: 'no-store'
    });
    if (!res.ok) return;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    decisions = data
      .filter(d => typeof d.t === 'number')
      .sort((a, b) => (a.t !== b.t ? a.t - b.t : a.hold - b.hold));

    CENTER_TIME = decisions[decisions.length - 1].t;
    renderAll();
  } catch (_) {
    /* silence */
  }
}

/* ===== TIME MAP ===== */
function timeToX(t) {
  return width / 2 + (t - CENTER_TIME) * TIME_SCALE;
}

function xToTime(x) {
  return CENTER_TIME + (x - width / 2) / TIME_SCALE;
}

/* ===== CLEAR ===== */
function clear(ctx) {
  ctx.clearRect(0, 0, width, height);
}

/* ===== LAYER 1 — DECISIONS ===== */
function renderLayer1() {
  const ctx = ctxs[0];
  clear(ctx);

  const baseY = height / 2 - LAYER_GAP;
  ctx.lineWidth = LINE_WIDTH;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';

  decisions.forEach(d => {
    const x = timeToX(d.t);
    const dir = d.w === 1 ? -1 : 1;
    const y = baseY + dir * 10;

    ctx.beginPath();
    ctx.arc(x, y, POINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    if (d.w !== -2 && d.hold > 0) {
      const tail = d.hold * HOLD_SCALE;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + dir * tail);
      ctx.stroke();
    }
  });
}

/* ===== LAYER 2 — DENSITY ===== */
function renderLayer2() {
  const ctx = ctxs[1];
  clear(ctx);

  const baseY = height / 2;
  ctx.lineWidth = LINE_WIDTH;
  ctx.strokeStyle = '#000';

  for (let i = 1; i < decisions.length; i++) {
    const a = decisions[i - 1];
    const b = decisions[i];
    if (a.w === -2) continue;

    const x1 = timeToX(a.t);
    const x2 = timeToX(b.t);

    ctx.beginPath();
    ctx.moveTo(x1, baseY);
    ctx.lineTo(x2, baseY);
    ctx.stroke();
  }
}

/* ===== LAYER 3 — TIME ===== */
function renderLayer3() {
  const ctx = ctxs[2];
  clear(ctx);

  const baseY = height / 2 + LAYER_GAP;
  ctx.lineWidth = LINE_WIDTH;
  ctx.strokeStyle = '#000';

  decisions.forEach(d => {
    const x = timeToX(d.t);
    ctx.beginPath();
    ctx.moveTo(x, baseY - 6);
    ctx.lineTo(x, baseY + 6);
    ctx.stroke();
  });
}

/* ===== CROSSHAIR ===== */
function renderCrosshair(x) {
  ctxs.forEach(ctx => {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.restore();
  });
}

/* ===== RENDER ===== */
function renderAll() {
  renderLayer1();
  renderLayer2();
  renderLayer3();
}

/* ===== INTERACTION ===== */
wrap.addEventListener('pointermove', e => {
  if (!CENTER_TIME) return;
  const rect = wrap.getBoundingClientRect();
  const x = e.clientX - rect.left;

  renderAll();
  renderCrosshair(x);

  const d = new Date(xToTime(x));
  timeLabel.textContent = d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
  timeLabel.style.opacity = 1;
});

wrap.addEventListener('pointerleave', () => {
  renderAll();
  timeLabel.style.opacity = 0;
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  window.history.back();
});

/* ===== INIT ===== */
resize();
loadSource();
