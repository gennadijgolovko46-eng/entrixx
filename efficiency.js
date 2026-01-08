// efficiency.js — Efficiency Layer V1 (stable, deterministic)

/*
Input:
- exits: array of exit_time (ms), sorted asc
Output:
- { limitTime: ms | null }
*/

const WINDOW_SIZE = 6;      // fixed
const RATIO_LIMIT = 6;     // fixed, deterministic
const MIN_EXITS = WINDOW_SIZE + 1;

export function computeEfficiency(exits) {
  if (!exits || exits.length < MIN_EXITS) {
    return { limitTime: null };
  }

  // Δt series
  const deltas = [];
  for (let i = 1; i < exits.length; i++) {
    deltas.push(exits[i] - exits[i - 1]);
  }

  // sliding window
  for (let i = WINDOW_SIZE - 1; i < deltas.length; i++) {
    const window = deltas.slice(i - WINDOW_SIZE + 1, i + 1);

    let min = Infinity;
    let max = 0;
    for (let j = 0; j < window.length; j++) {
      const v = window[j];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    if (min > 0 && max / min >= RATIO_LIMIT) {
      // one-time limit
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
  const span = dayEnd - dayStart;
  const timeToX = t => span > 0 ? ((t - dayStart) / span) * width : 0;

  ctx.save();

  // green base
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, width, barHeight);

  if (limitTime) {
    const x = timeToX(limitTime);

    // red vertical
    ctx.strokeStyle = "#E53935";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, y);
    ctx.lineTo(x + 0.5, y + barHeight);
    ctx.stroke();

    // gray after
    ctx.fillStyle = "#B0B0B0";
    ctx.fillRect(x, y, width - x, barHeight);
  }

  ctx.restore();
}
