/* ===============================
   ENTRIXX — MIRROR (SCRUB ONLY)
   =============================== */

const wrap = document.getElementById('wrap');
const backBtn = document.getElementById('back');
const timeTop = document.getElementById('time'); // not used yet

// create bottom time label dynamically
const timeBottom = document.createElement('div');
timeBottom.style.position = 'fixed';
timeBottom.style.bottom = '12px';
timeBottom.style.left = '50%';
timeBottom.style.transform = 'translateX(-50%)';
timeBottom.style.fontSize = '12px';
timeBottom.style.lineHeight = '1';
timeBottom.style.whiteSpace = 'nowrap';
timeBottom.style.opacity = '0';
timeBottom.style.pointerEvents = 'none';
document.body.appendChild(timeBottom);

/* ===== TIME STATE ===== */
let CENTER_TIME = Date.now();

/* ===== SCRUB STATE ===== */
let isTouching = false;
let isScrubbing = false;
let lastX = null;

/* ===== CONFIG ===== */
const TIME_SCALE = 0.00005; // same scale as before

/* ===== HELPERS ===== */
function showBottomTime() {
  timeBottom.style.opacity = '1';
}

function hideBottomTime() {
  timeBottom.style.opacity = '0';
}

function updateBottomTime() {
  const d = new Date(CENTER_TIME);
  timeBottom.textContent = d.toUTCString().slice(0, 22);
}

/* ===== INPUT ===== */
wrap.addEventListener('touchstart', e => {
  isTouching = true;
  isScrubbing = false;
  lastX = e.touches[0].clientX;
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  if (!isTouching) return;

  e.preventDefault();

  const x = e.touches[0].clientX;
  const dx = x - lastX;
  lastX = x;

  // start scrubbing on first move
  isScrubbing = true;

  // move time: dragging right → past, left → future (TradingView-like)
  CENTER_TIME -= dx / TIME_SCALE;

  updateBottomTime();
  showBottomTime();

  // TODO later:
  // renderStaticLayers(CENTER_TIME)
}, { passive: false });

wrap.addEventListener('touchend', () => {
  isTouching = false;
  isScrubbing = false;
  lastX = null;
  hideBottomTime();
});

wrap.addEventListener('mousedown', e => {
  isTouching = true;
  isScrubbing = false;
  lastX = e.clientX;
});

wrap.addEventListener('mousemove', e => {
  if (!isTouching) return;

  const x = e.clientX;
  const dx = x - lastX;
  lastX = x;

  isScrubbing = true;
  CENTER_TIME -= dx / TIME_SCALE;

  updateBottomTime();
  showBottomTime();
});

wrap.addEventListener('mouseup', () => {
  isTouching = false;
  isScrubbing = false;
  lastX = null;
  hideBottomTime();
});

wrap.addEventListener('mouseleave', () => {
  isTouching = false;
  isScrubbing = false;
  lastX = null;
  hideBottomTime();
});

/* ===== NAV ===== */
backBtn.addEventListener('click', () => {
  history.back();
});

/* ===== INIT ===== */
updateBottomTime();
