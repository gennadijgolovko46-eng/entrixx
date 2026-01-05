const wrap = document.getElementById('wrap');
const timeLabel = document.getElementById('time');
const backBtn = document.getElementById('back');

const canvases = [
  document.getElementById('layer1'),
  document.getElementById('layer2'),
  document.getElementById('layer3')
];

const ctxs = canvases.map(c => c.getContext('2d'));

let width = 0;
let height = 0;

function resize() {
  width = wrap.clientWidth;
  height = wrap.clientHeight;

  canvases.forEach(c => {
    c.width = width;
    c.height = height;
  });

  render();
}

window.addEventListener('resize', resize);

/* ---- TIME MODEL ---- */

const CENTER_TIME = Date.now();
const TIME_SCALE = 60 * 1000;

function xToTime(x) {
  const dx = x - width / 2;
  return CENTER_TIME + dx * TIME_SCALE;
}

/* ---- MOCK DATA (TEMP) ---- */

const decisions = [
  { t: CENTER_TIME - 6 * TIME_SCALE, w: 1, hold: 3 },
  { t: CENTER_TIME - 4 * TIME_SCALE, w: -1, hold: 1 },
  { t: CENTER_TIME - 2 * TIME_SCALE, w: -2, hold: 0 },
  { t: CENTER_TIME + 1 * TIME_SCALE, w: 1, hold: 2 }
];

/* ---- RENDER ---- */

function clear() {
  ctxs.forEach(ctx => {
    ctx.clearRect(0, 0, width, height);
  });
}

function renderLayer1() {
  const ctx = ctxs[0];
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  decisions.forEach(d => {
    const x = width / 2 + (d.t - CENTER_TIME) / TIME_SCALE;
    const y = height / 2;

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.stroke();

    if (d.hold > 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + d.hold * 10);
      ctx.stroke();
    }
  });
}

function renderLayer2() {
  const ctx = ctxs[1];
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  for (let i = 1; i < decisions.length; i++) {
    const a = decisions[i - 1];
    const b = decisions[i];

    if (a.w === -2 || b.w === -2) continue;

    const x1 = width / 2 + (a.t - CENTER_TIME) / TIME_SCALE;
    const x2 = width / 2 + (b.t - CENTER_TIME) / TIME_SCALE;
    const y = height / 2 + 20;

    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }
}

function renderLayer3() {
  const ctx = ctxs[2];
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
}

function render() {
  clear();
  renderLayer1();
  renderLayer2();
  renderLayer3();
}

/* ---- CROSSHAIR TIME ---- */

function showTime(x) {
  const d = new Date(xToTime(x));
  timeLabel.textContent = d.toUTCString().slice(0, 22);
  timeLabel.style.left = x + 'px';
  timeLabel.style.opacity = 1;
}

function hideTime() {
  timeLabel.style.opacity = 0;
}

wrap.addEventListener('pointermove', e => {
  const rect = wrap.getBoundingClientRect();
  const x = e.clientX - rect.left;
  showTime(x);
});

wrap.addEventListener('pointerleave', hideTime);

/* ---- NAV ---- */

backBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

/* ---- INIT ---- */

resize();
