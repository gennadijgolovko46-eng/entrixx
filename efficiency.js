// efficiency.js — Efficiency Layer (canonical)

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
  const { dayStart, dayEnd, limitTime, width, height, barHeight = 6 } = opts;

  function timeToX(t) {
    const span = dayEnd - dayStart;
    if (span <= 0) return 0;
    return ((t - dayStart) / span) * width;
  }

  ctx.save();

  const yBar = height - barHeight;

  if (!limitTime) {
    ctx.fillStyle = "#2DBE60";
    ctx.fillRect(0, yBar, width, barHeight);
    ctx.restore();
    return;
  }

  const xLimit = timeToX(limitTime);

  // green zone
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, yBar, xLimit, barHeight);

  // red vertical line — full height
  ctx.strokeStyle = "#D10000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(xLimit + 0.5, 0);
  ctx.lineTo(xLimit + 0.5, height);
  ctx.stroke();

  // grey zone
  ctx.fillStyle = "#B0B0B0";
  ctx.fillRect(xLimit, yBar, width - xLimit, barHeight);

  ctx.restore();
}
