/* ===============================
   ENTRIXX — MIRROR (LINE SIMPLE)
   =============================== */

const wrap = document.getElementById('wrap');
const backBtn = document.getElementById('back');

const canvas = document.getElementById('layer3'); // use top canvas only
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
  redraw();
}

window.addEventListener('resize', resize);

/* ===== DRAW ===== */
function redraw() {
  ctx.clearRect(0, 0, width, height);

  if (cursorX === null) return;

  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cursorX + 0.5, 0);
  ctx.lineTo(cursorX + 0.5, height);
  ctx.stroke();
}

/* ===== INPUT ===== */
function updateFromClientX(clientX) {
  const rect = wrap.getBoundingClientRect();
  cursorX = clientX - rect.left;
  redraw();
}

wrap.addEventListener('touchstart', e => {
  e.preventDefault();
  updateFromClientX(e.touches[0].clientX);
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  e.preventDefault();
  updateFromClientX(e.touches[0].clientX);
}, { passive: false });

wrap.addEventListener('mousemove', e => {
  updateFromClientX(e.clientX);
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  history.back();
});

/* ===== INIT ===== */
resize();
