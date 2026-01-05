/* ===============================
   ENTRIXX — MIRROR (TIME CLAMP)
   =============================== */

const wrap = document.getElementById('wrap');
const backBtn = document.getElementById('back');
const timeLabel = document.getElementById('time');

const canvas = document.getElementById('layer3');
const ctx = canvas.getContext('2d');

const DPR = Math.min(window.devicePixelRatio || 1, 2);

let width = 0;
let height = 0;

/* ===== SIZE ===== */
function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;

  canvas.width = width * DPR;
  canvas.height = height * DPR;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  clear();
}
window.addEventListener('resize', resize);

/* ===== DRAW ===== */
function clear() {
  ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
}

function drawLine(x) {
  clear();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, 0);
  ctx.lineTo(x + 0.5, canvas.height / DPR);
  ctx.stroke();
}

/* ===== TIME ===== */
function xToTime(x) {
  const now = Date.now();
  const span = 6 * 60 * 60 * 1000; // временно
  const t = now + ((x / width) - 0.5) * span;
  return new Date(t);
}

function showTime(x) {
  const d = xToTime(x);
  timeLabel.textContent = d.toUTCString().slice(0, 22);

  // дать браузеру посчитать ширину
  const labelWidth = timeLabel.offsetWidth;
  const margin = 8;

  let left = x;

  const min = labelWidth / 2 + margin;
  const max = width - labelWidth / 2 - margin;

  if (left < min) left = min;
  if (left > max) left = max;

  timeLabel.style.left = left + 'px';
  timeLabel.style.opacity = 1;
}

function hideTime() {
  timeLabel.style.opacity = 0;
}

/* ===== INPUT ===== */
function updateFromClientX(clientX) {
  const rect = wrap.getBoundingClientRect();
  const x = clientX - rect.left;
  drawLine(x);
  showTime(x);
}

wrap.addEventListener('touchstart', e => {
  e.preventDefault();
  updateFromClientX(e.touches[0].clientX);
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  e.preventDefault();
  updateFromClientX(e.touches[0].clientX);
}, { passive: false });

wrap.addEventListener('touchend', () => {
  clear();
  hideTime();
});

wrap.addEventListener('mousemove', e => {
  updateFromClientX(e.clientX);
});

wrap.addEventListener('mouseleave', () => {
  clear();
  hideTime();
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  history.back();
});

/* ===== INIT ===== */
resize();
