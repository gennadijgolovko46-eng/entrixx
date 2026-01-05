/* ===============================
   ENTRIXX — MIRROR
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

const canvasData1 = document.getElementById('layer1');
const canvasData2 = document.getElementById('layer2');
const canvasOverlay = document.getElementById('layer3');

const ctx1 = canvasData1.getContext('2d');
const ctx2 = canvasData2.getContext('2d');
const ctxOverlay = canvasOverlay.getContext('2d');

/* ===== DPI ===== */
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ===== SIZE ===== */
let width = 0;
let height = 0;

function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;

  [canvasData1, canvasData2, canvasOverlay].forEach(c => {
    c.width = width * DPR;
    c.height = height * DPR;
    c.style.width = width + 'px';
    c.style.height = height + 'px';
  });

  [ctx1, ctx2, ctxOverlay].forEach(ctx => {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  });

  renderStatic();
}

window.addEventListener('resize', resize);

/* ===== STATE ===== */
let decisions = [];
let CENTER_TIME = 0;
let cursorX = null;
let isTouching = false;

/* ===== SOURCE ===== */
async function loadSource() {
  try {
    const res = await fetch('source.json', { cache: 'no-store' });
    if (!res.ok) return;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    decisions = data
      .filter(d => typeof d.t === 'number')
      .sort((a, b) => a.t - b.t);

    CENTER_TIME = decisions[decisions.length - 1].t;
    renderStatic();
  } catch (_) {}
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

/* ===== STATIC RENDER ===== */
function renderStatic() {
  clear(ctx1);
  clear(ctx2);
  clear(ctxOverlay);

  renderLayer1();
  renderLayer2();
}

/* ===== LAYER 1 — DECISIONS ===== */
function renderLayer1() {
  const baseY = height / 2 - LAYER_GAP;
  ctx1.lineWidth = LINE_WIDTH;
  ctx1.strokeStyle = '#000';
  ctx1.fillStyle = '#000';

  decisions.forEach(d => {
    const x = timeToX(d.t);

    if (d.w === -2) {
      ctx1.beginPath();
      ctx1.moveTo(x - 4, baseY - 4);
      ctx1.lineTo(x + 4, baseY + 4);
      ctx1.moveTo(x + 4, baseY - 4);
      ctx1.lineTo(x - 4, baseY + 4);
      ctx1.stroke();
      return;
    }

    const dir = d.w === 1 ? -1 : 1;
    const y = baseY + dir * 10;

    ctx1.beginPath();
    ctx1.arc(x, y, POINT_RADIUS, 0, Math.PI * 2);
    ctx1.fill();

    if (d.hold > 0) {
      const tail = d.hold * HOLD_SCALE;
      ctx1.beginPath();
      ctx1.moveTo(x, y);
      ctx1.lineTo(x, y + dir * tail);
      ctx1.stroke();
    }
  });
}

/* ===== LAYER 2 — DENSITY ===== */
function renderLayer2() {
  const baseY = height / 2;
  ctx2.lineWidth = LINE_WIDTH;
  ctx2.strokeStyle = '#000';

  for (let i = 1; i < decisions.length; i++) {
    const a = decisions[i - 1];
    const b = decisions[i];
    if (a.w === -2 || b.w === -2) continue;

    ctx2.beginPath();
    ctx2.moveTo(timeToX(a.t), baseY);
    ctx2.lineTo(timeToX(b.t), baseY);
    ctx2.stroke();
  }
}

/* ===== OVERLAY — LINE ===== */
function renderLine(x) {
  clear(ctxOverlay);

  ctxOverlay.save();
  ctxOverlay.strokeStyle = 'rgba(0,0,0,0.15)';
  ctxOverlay.lineWidth = 1;
  ctxOverlay.beginPath();
  ctxOverlay.moveTo(x + 0.5, 0);
  ctxOverlay.lineTo(x + 0.5, height);
  ctxOverlay.stroke();
  ctxOverlay.restore();
}

/* ===== TOUCH ===== */
wrap.addEventListener('touchstart', e => {
  if (!CENTER_TIME) return;
  isTouching = true;
  e.preventDefault();

  const rect = wrap.getBoundingClientRect();
  cursorX = e.touches[0].clientX - rect.left;

  renderLine(cursorX);
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  if (!isTouching || !CENTER_TIME) return;
  e.preventDefault();

  const rect = wrap.getBoundingClientRect();
  cursorX = e.touches[0].clientX - rect.left;

  renderLine(cursorX);
}, { passive: false });

wrap.addEventListener('touchend', () => {
  isTouching = false;
  clear(ctxOverlay);
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  window.history.back();
});

/* ===== INIT ===== */
resize();
loadSource();
