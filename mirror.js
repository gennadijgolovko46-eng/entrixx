/* ===============================
   ENTRIXX — MIRROR
   Axis (24h) + Layer 1 (Decisions)
   =============================== */

const wrap = document.getElementById('wrap');
const backBtn = document.getElementById('back');

/* ===== CANVASES ===== */
const layerDecisions = document.getElementById('layer1');
const layerAxis = document.getElementById('layer3');

const ctxDecisions = layerDecisions.getContext('2d');
const ctxAxis = layerAxis.getContext('2d');

/* ===== SIZE ===== */
let width = 0;
let height = 0;

function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;

  layerDecisions.width = width;
  layerDecisions.height = height;
  layerAxis.width = width;
  layerAxis.height = height;

  drawAxis();
  renderDecisions();
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

    renderDecisions();
  } catch (_) {}
}

/* ===== TIME ↔ X ===== */
function timeToX(t) {
  const dx = (t - CENTER_TIME) / DAY_MS;
  return width / 2 + dx * width;
}

/* ===== AXIS ===== */
function drawAxis() {
  ctxAxis.clearRect(0, 0, width, height);

  ctxAxis.strokeStyle = 'rgba(0,0,0,0.15)';
  ctxAxis.lineWidth = 1;

  const x = Math.round(width / 2) + 0.5;

  ctxAxis.beginPath();
  ctxAxis.moveTo(x, 0);
  ctxAxis.lineTo(x, height);
  ctxAxis.stroke();
}

/* ===== DECISIONS LAYER ===== */
function renderDecisions() {
  ctxDecisions.clearRect(0, 0, width, height);

  const baseY = height / 2;
  ctxDecisions.lineWidth = 1;
  ctxDecisions.strokeStyle = '#000';
  ctxDecisions.fillStyle = '#000';

  decisions.forEach(d => {
    const x = timeToX(d.t);
    if (x < -20 || x > width + 20) return;

    if (d.w === -2) {
      ctxDecisions.beginPath();
      ctxDecisions.moveTo(x - 4, baseY - 4);
      ctxDecisions.lineTo(x + 4, baseY + 4);
      ctxDecisions.moveTo(x + 4, baseY - 4);
      ctxDecisions.lineTo(x - 4, baseY + 4);
      ctxDecisions.stroke();
      return;
    }

    const dir = d.w === 1 ? -1 : 1;
    const y = baseY + dir * 10;

    ctxDecisions.beginPath();
    ctxDecisions.arc(x, y, 2, 0, Math.PI * 2);
    ctxDecisions.fill();

    if (d.hold > 0) {
      const tail = d.hold * 0.00004;
      ctxDecisions.beginPath();
      ctxDecisions.moveTo(x, y);
      ctxDecisions.lineTo(x, y + dir * tail);
      ctxDecisions.stroke();
    }
  });
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
  const d = new Date(CENTER_TIME);
  timeBottom.textContent = d.toUTCString().slice(0, 22);
}

/* ===== SCRUB ===== */
let isDragging = false;
let lastX = null;

function scrub(dx) {
  const timePerPixel = DAY_MS / width;
  CENTER_TIME -= dx * timePerPixel;
  updateBottomTime();
  renderDecisions();
}

wrap.addEventListener('touchstart', e => {
  isDragging = true;
  lastX = e.touches[0].clientX;
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  if (!isDragging) return;
  e.preventDefault();

  const x = e.touches[0].clientX;
  scrub(x - lastX);
  lastX = x;
}, { passive: false });

wrap.addEventListener('touchend', () => {
  isDragging = false;
  lastX = null;
});

wrap.addEventListener('mousedown', e => {
  isDragging = true;
  lastX = e.clientX;
});

wrap.addEventListener('mousemove', e => {
  if (!isDragging) return;
  scrub(e.clientX - lastX);
  lastX = e.clientX;
});

wrap.addEventListener('mouseup', () => {
  isDragging = false;
  lastX = null;
});

wrap.addEventListener('mouseleave', () => {
  isDragging = false;
  lastX = null;
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => history.back());

/* ===== INIT ===== */
resize();
updateBottomTime();
loadSource();
