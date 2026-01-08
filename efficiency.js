// efficiency.js — Efficiency Layer V1 (locked)

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
    return span > 0 ? ((t - dayStart) / span) * width : 0;
  }

  ctx.save();

  // green baseline
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, width, barHeight);

  if (limitTime) {
    const x = timeToX(limitTime);

    // gray zone after limit
    ctx.fillStyle = "#B0B0B0";
    ctx.fillRect(x, y, width - x, barHeight);

    // red line on top
    ctx.strokeStyle = "#E53935";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, y - 2);
    ctx.lineTo(x + 0.5, y + barHeight + 2);
    ctx.stroke();
  }

  ctx.restore();
}
