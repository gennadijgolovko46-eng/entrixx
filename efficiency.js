// efficiency.js — Efficiency Layer V1

const WINDOW_SIZE = 6;
const THRESHOLD = 3.5e10;
const MIN_EXITS = WINDOW_SIZE + 1;

export function computeEfficiency(exits) {
  if (!exits || exits.length < MIN_EXITS) {
    return { limitTime: null };
  }

  const deltas = [];
  for (let i = 1; i < exits.length; i++) {
    deltas.push(exits[i] - exits[i - 1]);
  }

  for (let i = WINDOW_SIZE - 1; i < deltas.length; i++) {
    const window = deltas.slice(i - WINDOW_SIZE + 1, i + 1);
    const mean = window.reduce((s, v) => s + v, 0) / WINDOW_SIZE;

    let variance = 0;
    for (let j = 0; j < window.length; j++) {
      const d = window[j] - mean;
      variance += d * d;
    }
    variance /= WINDOW_SIZE;

    if (variance > THRESHOLD) {
      return { limitTime: exits[i + 1] };
    }
  }

  return { limitTime: null };
}

export function drawEfficiencyLayer(ctx, opts) {
  const {
    dayStart,
    dayEnd,
    limitTime,
    width,
    height,
    barHeight = 6
  } = opts;

  const y = height - barHeight;

  function timeToX(t) {
    const span = dayEnd - dayStart;
    if (span <= 0) return 0;
    return ((t - dayStart) / span) * width;
  }

  ctx.save();

  if (!limitTime) {
    ctx.fillStyle = "#2DBE60";
    ctx.fillRect(0, y, width, barHeight);
    ctx.restore();
    return;
  }

  const xLimit = timeToX(limitTime);

  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, xLimit, barHeight);

  ctx.strokeStyle = "#E53935";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(xLimit + 0.5, y);
  ctx.lineTo(xLimit + 0.5, y + barHeight);
  ctx.stroke();

  ctx.fillStyle = "#B0B0B0";
  ctx.fillRect(xLimit, y, width - xLimit, barHeight);

  ctx.restore();
}
