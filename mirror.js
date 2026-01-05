/* ===============================
   ENTRIXX — MIRROR (LINE FIXED)
   =============================== */

const wrap = document.getElementById('wrap');
const backBtn = document.getElementById('back');

const canvas = document.getElementById('layer3');
const ctx = canvas.getContext('2d');

const DPR = Math.min(window.devicePixelRatio || 1, 2);

let width = 0;
let height = 0;
let cursorX = null;

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

  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, 0);
  ctx.lineTo(x + 0.5, canvas.height / DPR);
  ctx.stroke();
}

/* ===== INPUT ===== */
function updateFromClientX(clientX) {
  const rect = wrap.getBoundingClientRect();
  cursorX = clientX - rect.left;
  drawLine(cursorX);
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
});

wrap.addEventListener('mousemove', e => {
  updateFromClientX(e.clientX);
});

wrap.addEventListener('mouseleave', () => {
  clear();
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  history.back();
});

/* ===== INIT ===== */
resize();
