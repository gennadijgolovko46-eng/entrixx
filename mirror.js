/* ===============================
   ENTRIXX — MIRROR (CENTER AXIS)
   =============================== */

const wrap = document.getElementById('wrap');
const backBtn = document.getElementById('back');

/* ===== CANVAS (CENTER LINE) ===== */
const canvas = document.getElementById('layer3');
const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;

/* ===== TIME MODEL ===== */
let CENTER_TIME = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

/* ===== BOTTOM TIME LABEL ===== */
const timeBottom = document.createElement('div');
timeBottom.style.position = 'fixed';
timeBottom.style.bottom = '12px';
timeBottom.style.left = '50%';
timeBottom.style.transform = 'translateX(-50%)';
timeBottom.style.fontSize = '12px';
timeBottom.style.lineHeight = '1';
timeBottom.style.whiteSpace = 'nowrap';
timeBottom.style.pointerEvents = 'none';
document.body.appendChild(timeBottom);

/* ===== SIZE ===== */
function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;

  canvas.width = width;
  canvas.height = height;

  drawCenterLine();
}
window.addEventListener('resize', resize);

/* ===== DRAW CENTER LINE ===== */
function drawCenterLine() {
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;

  const x = Math.round(width / 2) + 0.5;

  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}

/* ===== TIME DISPLAY ===== */
function updateBottomTime() {
  const d = new Date(CENTER_TIME);
  timeBottom.textContent = d.toUTCString().slice(0, 22);
}

/* ===== SCRUB ===== */
let isTouching = false;
let lastX = null;

function applyScrub(dx) {
  const timePerPixel = DAY_MS / width;
  CENTER_TIME -= dx * timePerPixel;
  updateBottomTime();
}

wrap.addEventListener('touchstart', e => {
  isTouching = true;
  lastX = e.touches[0].clientX;
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  if (!isTouching) return;
  e.preventDefault();

  const x = e.touches[0].clientX;
  const dx = x - lastX;
  lastX = x;

  applyScrub(dx);
}, { passive: false });

wrap.addEventListener('touchend', () => {
  isTouching = false;
  lastX = null;
});

wrap.addEventListener('mousedown', e => {
  isTouching = true;
  lastX = e.clientX;
});

wrap.addEventListener('mousemove', e => {
  if (!isTouching) return;

  const x = e.clientX;
  const dx = x - lastX;
  lastX = x;

  applyScrub(dx);
});

wrap.addEventListener('mouseup', () => {
  isTouching = false;
  lastX = null;
});

wrap.addEventListener('mouseleave', () => {
  isTouching = false;
  lastX = null;
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  history.back();
});

/* ===== INIT ===== */
resize();
updateBottomTime();
