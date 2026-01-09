// efficiency.js — Efficiency Layer FINAL

const WINDOW_SIZE = 6;
const THRESHOLD_CV = 0.45; // coefficient of variation
const MIN_EXITS = WINDOW_SIZE + 1;

export function computeEfficiency(exitTimes) {
  if (!exitTimes || exitTimes.length < MIN_EXITS) {
    return { limitTime: null };
  }

  const deltas = [];
  for (let i = 1; i < exitTimes.length; i++) {
    deltas.push(exitTimes[i] - exitTimes[i - 1]);
  }

  for (let i = WINDOW_SIZE - 1; i < deltas.length; i++) {
    const window = deltas.slice(i - WINDOW_SIZE + 1, i + 1);

    const mean =
      window.reduce((s, v) => s + v, 0) / window.length;

    if (mean <= 0) continue;

    let variance = 0;
    for (let j = 0; j < window.length; j++) {
      const d = window[j] - mean;
      variance += d * d;
    }
    variance /= window.length;

    const sigma = Math.sqrt(variance);
    const cv = sigma / mean;

    if (cv > THRESHOLD_CV) {
      // IMPORTANT:
      // limitTime is AFTER the atom, not on it
      const offset = mean;
      return {
        limitTime: exitTimes[i + 1] + offset
      };
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

  // green zone
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, xLimit, barHeight);

  // red vertical line (FULL SCREEN)
  ctx.strokeStyle = "#D10000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(xLimit + 0.5, 0);
  ctx.lineTo(xLimit + 0.5, height);
  ctx.stroke();

  // grey zone
  ctx.fillStyle = "#B0B0B0";
  ctx.fillRect(xLimit, y, width - xLimit, barHeight);

  ctx.restore();
}
