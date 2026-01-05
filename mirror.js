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
const backBtn = document.getElementById('back');

const canvas1 = document.getElementById('layer1');
const canvas2 = document.getElementById('layer2');
const canvas3 = document.getElementById('layer3');

const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const ctx3 = canvas3.getContext('2d');

/* ===== DPI ===== */
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ===== SIZE ===== */
let width = 0;
let height = 0;

function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;

  [canvas1, canvas2, canvas3].forEach(c => {
    c.width = width * DPR;
    c.height = height * DPR;
    c.style.width = width + 'px';
    c.style.height = height + 'px';
  });

  [ctx1, ctx2, ctx3].forEach(ctx => {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  });

  renderStatic();
}
window.addEventListener('resize', resize);

/* ===== STATE ===== */
let decisions = [];
let CENTER_TIME = 0;

/* ===== SOURCE ===== */
async function loadSource() {
  try {
    const res = await fetch('source.json', { cache: 'no-store' });
    if (!res.ok) return;

    const data = await res.json();
    if (!Array.isArray(data)) return;

    decisions = data
      .filter(d => typeof d.t === 'number')
      .sort((a, b) => a.t - b.t);

    if (decisions.length > 0) {
      CENTER_TIME = decisions[decisions.length - 1].t;
    }

    renderStatic();
  } catch (_) {}
}

/* ===== TIME MAP ===== */
function timeToX(t) {
  return width / 2 + (t - CENTER_TIME) * TIME_SCALE;
}

/* ===== CLEAR ===== */
function clear(ctx) {
  ctx.clearRect(0, 0, width, height);
}

/* ===== STATIC RENDER ===== */
function renderStatic() {
  clear(ctx1);
  clear(ctx2);

  renderLayer1();
  renderLayer2();
}

/* ===== LAYER 1 ===== */
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

/* ===== LAYER 2 ===== */
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

/* ===== LINE (OVERLAY) ===== */
function drawLine(x) {
  clear(ctx3);
  ctx3.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx3.lineWidth = 1;
  ctx3.beginPath();
  ctx3.moveTo(x + 0.5, 0);
  ctx3.lineTo(x + 0.5, height);
  ctx3.stroke();
}

/* ===== INPUT ===== */
function handleMove(clientX) {
  const rect = wrap.getBoundingClientRect();
  const x = clientX - rect.left;
  drawLine(x);
}

wrap.addEventListener('touchmove', e => {
  e.preventDefault();
  handleMove(e.touches[0].clientX);
}, { passive: false });

wrap.addEventListener('touchstart', e => {
  e.preventDefault();
  handleMove(e.touches[0].clientX);
}, { passive: false });

wrap.addEventListener('touchend', () => {
  clear(ctx3);
});

wrap.addEventListener('mousemove', e => {
  handleMove(e.clientX);
});

wrap.addEventListener('mouseleave', () => {
  clear(ctx3);
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  history.back();
});

/* ===== INIT ===== */
resize();
loadSource();
