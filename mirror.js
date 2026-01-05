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

  clear();
}

window.addEventListener('resize', resize);
resize();

function clear() {
  ctxs.forEach(ctx => {
    ctx.clearRect(0, 0, width, height);
  });
}

backBtn.onclick = () => {
  window.location.href = '/';
};

const TIME_SPAN = 30 * 24 * 60 * 60 * 1000;
const CENTER_TIME = Date.now();

function xToTime(x) {
  const r = x / width;
  return CENTER_TIME - TIME_SPAN / 2 + r * TIME_SPAN;
}

function drawCrosshair(x) {
  clear();

  ctxs.forEach(ctx => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function showTime(x) {
  const d = new Date(xToTime(x));
  timeLabel.textContent = d.toUTCString().slice(0, 22);
  timeLabel.style.opacity = 1;
  timeLabel.style.left = x + 'px';
}

function hideTime() {
  timeLabel.style.opacity = 0;
}

wrap.addEventListener('pointermove', e => {
  const rect = wrap.getBoundingClientRect();
  const x = e.clientX - rect.left;

  drawCrosshair(x);
  showTime(x);
});

wrap.addEventListener('pointerleave', () => {
  clear();
  hideTime();
});
