// efficiency.js — Efficiency Layer V3 (final, stable)

// ----- CONFIG -----
const MIN_EXITS = 7;
const WINDOW = 6;
const CV_THRESHOLD = 0.6;

// ----- MATH -----
function mean(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / a.length;
}

function std(a, m) {
  let v = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - m;
    v += d * d;
  }
  return Math.sqrt(v / a.length);
}

// ----- CORE -----
export function computeEfficiency(exitTimes) {
  if (!exitTimes || exitTimes.length < MIN_EXITS) {
    return { limitTime: null };
  }

  const deltas = [];
  for (let i = 1; i < exitTimes.length; i++) {
    deltas.push(exitTimes[i] - exitTimes[i - 1]);
  }

  for (let i = WINDOW - 1; i < deltas.length; i++) {
    const w = deltas.slice(i - WINDOW + 1, i + 1);
    const mu = mean(w);
    if (mu <= 0) continue;

    const cv = std(w, mu) / mu;
    if (cv > CV_THRESHOLD) {
      return { limitTime: exitTimes[i + 1] };
    }
  }

  return { limitTime: null };
}

// ----- DRAW -----
export function drawEfficiencyLayer(ctx, opts) {
  const { dayStart, dayEnd, limitTime, width, height, barHeight = 6 } = opts;
  const y = height - barHeight;

  function timeToX(t) {
    return ((t - dayStart) / (dayEnd - dayStart)) * width;
  }

  ctx.save();

  // no break -> full green
  if (!limitTime) {
    ctx.fillStyle = "#2DBE60";
    ctx.fillRect(0, y, width, barHeight);
    ctx.restore();
    return;
  }

  const x = timeToX(limitTime);

  // green before
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, x, barHeight);

  // red vertical line (FULL SCREEN)
  ctx.strokeStyle = "#D10000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, 0);
  ctx.lineTo(x + 0.5, height);
  ctx.stroke();

  // grey after
  ctx.fillStyle = "#B0B0B0";
  ctx.fillRect(x, y, width - x, barHeight);

  ctx.restore();
}
