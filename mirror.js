/* ===============================
   ENTRIXX — MIRROR
   Density with Inertia (Final)
   =============================== */

const wrap = document.getElementById('wrap');
const backBtn = document.getElementById('back');

/* ===== CANVASES ===== */
const layerDecisions = document.getElementById('layer1');
const layerDensity   = document.getElementById('layer2');
const layerAxis      = document.getElementById('layer3');

const ctxDecisions = layerDecisions.getContext('2d');
const ctxDensity   = layerDensity.getContext('2d');
const ctxAxis      = layerAxis.getContext('2d');

/* ===== SIZE ===== */
let width = 0;
let height = 0;

function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;

  [layerDecisions, layerDensity, layerAxis].forEach(c => {
    c.width = width;
    c.height = height;
  });

  drawAxis();
  renderAll();
}
window.addEventListener('resize', resize);

/* ===== TIME MODEL ===== */
const DAY_MS = 24 * 60 * 60 * 1000;
let CENTER_TIME = Date.now();

/* ===== DATA ===== */
let decisions = [];

/* ===== LOAD SOURCE ===== */
async function loadSource() {
  try {
    const res = await fetch('source.json', { cache: 'no-store' });
    if (!res.ok) return;

    const data = await res.json();
    if (!Array.isArray(data)) return;

    decisions = data
      .filter(d => typeof d.t === 'number')
      .sort((a, b) => a.t - b.t);

    if (decisions.length) {
      CENTER_TIME = decisions[decisions.length - 1].t;
      updateBottomTime();
    }

    renderAll();
  } catch (_) {}
}

/* ===== TIME ↔ X ===== */
function timeToX(t) {
  return width / 2 + ((t - CENTER_TIME) / DAY_MS) * width;
}

/* ===== AXIS ===== */
function drawAxis() {
  ctxAxis.clearRect(0, 0, width, height);
  ctxAxis.strokeStyle = 'rgba(0,0,0,0.12)';
  ctxAxis.lineWidth = 1;

  const x = Math.round(width / 2) + 0.5;
  ctxAxis.beginPath();
  ctxAxis.moveTo(x, 0);
  ctxAxis.lineTo(x, height);
  ctxAxis.stroke();
}

/* ===== DENSITY WITH INERTIA ===== */
function renderDensity() {
  ctxDensity.clearRect(0, 0, width, height);

  const baseY = height / 2;
  const Tref = 15 * 60 * 1000; // 15 минут терпения
  const lambda = 0.85;         // инерция
  let prevD = 0;

  ctxDensity.strokeStyle = 'rgba(0,0,0,0.35)';
  ctxDensity.lineWidth = 1;

  for (let i = 0; i < decisions.length - 1; i++) {
    const a = decisions[i];
    const b = decisions[i + 1];

    const dt = b.t - a.t;
    if (dt <= 0) continue;

    // базовая плотность интервала
    let D0 = Math.max(0, 1 - dt / Tref);

    // обрыв (ликвидация)
    if (a.w === -2 || b.w === -2) {
      prevD = 0;
      continue;
    }

    // инерция
    let D = Math.max(D0, lambda * prevD);
    prevD = D;

    if (D <= 0) continue;

    const x1 = timeToX(a.t);
    const x2 = timeToX(b.t);
    if (x2 < -20 || x1 > width + 20) continue;

    // визуальное давление
    const layers = Math.ceil(D * 6);

    for (let l = 0; l < layers; l++) {
      const y = baseY + (l - layers / 2) * 2;
      ctxDensity.beginPath();
      ctxDensity.moveTo(x1, y);
      ctxDensity.lineTo(x2, y);
      ctxDensity.stroke();
    }
  }
}

/* ===== DECISIONS (SECONDARY) ===== */
function renderDecisions() {
  ctxDecisions.clearRect(0, 0, width, height);

  const baseY = height / 2;
  const OFFSET = 18;

  ctxDecisions.strokeStyle = '#000';
  ctxDecisions.fillStyle = '#000';
  ctxDecisions.lineWidth = 1;

  decisions.forEach(d => {
    const x = timeToX(d.t);
    if (x < -30 || x > width + 30) return;

    // ликвидация — разрыв
    if (d.w === -2) {
      const s = 6;
      ctxDecisions.beginPath();
      ctxDecisions.moveTo(x - s, baseY - s);
      ctxDecisions.lineTo(x + s, baseY + s);
      ctxDecisions.moveTo(x + s, baseY - s);
      ctxDecisions.lineTo(x - s, baseY + s);
      ctxDecisions.stroke();
      return;
    }

    const y = baseY + (d.w === 1 ? -OFFSET : OFFSET);

    ctxDecisions.beginPath();
    ctxDecisions.arc(x, y, 2, 0, Math.PI * 2);
    ctxDecisions.fill();

    if (d.hold > 0) {
      const tail = d.hold * 0.00004;
      ctxDecisions.beginPath();
      ctxDecisions.moveTo(x, y);
      ctxDecisions.lineTo(x, y + tail);
      ctxDecisions.stroke();
    }
  });
}

/* ===== RENDER ===== */
function renderAll() {
  renderDensity();
  renderDecisions();
}

/* ===== BOTTOM TIME ===== */
const timeBottom = document.createElement('div');
timeBottom.style.position = 'fixed';
timeBottom.style.bottom = '12px';
timeBottom.style.left = '50%';
timeBottom.style.transform = 'translateX(-50%)';
timeBottom.style.fontSize = '12px';
timeBottom.style.whiteSpace = 'nowrap';
timeBottom.style.pointerEvents = 'none';
document.body.appendChild(timeBottom);

function updateBottomTime() {
  timeBottom.textContent = new Date(CENTER_TIME).toUTCString().slice(0, 22);
}

/* ===== SCRUB ===== */
let dragging = false;
let lastX = null;

function scrub(dx) {
  CENTER_TIME -= dx * (DAY_MS / width);
  updateBottomTime();
  renderAll();
}

wrap.addEventListener('touchstart', e => {
  dragging = true;
  lastX = e.touches[0].clientX;
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  if (!dragging) return;
  e.preventDefault();
  scrub(e.touches[0].clientX - lastX);
  lastX = e.touches[0].clientX;
}, { passive: false });

wrap.addEventListener('touchend', () => dragging = false);

wrap.addEventListener('mousedown', e => {
  dragging = true;
  lastX = e.clientX;
});

wrap.addEventListener('mousemove', e => {
  if (!dragging) return;
  scrub(e.clientX - lastX);
  lastX = e.clientX;
});

wrap.addEventListener('mouseup', () => dragging = false);
wrap.addEventListener('mouseleave', () => dragging = false);

/* ===== NAV ===== */
backBtn.addEventListener('click', () => history.back());

/* ===== INIT ===== */
resize();
updateBottomTime();
loadSource();
