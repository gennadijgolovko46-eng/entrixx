// efficiency.js — Efficiency Layer V1 (CV based, locked)

// Product constants (fixed for V1)
const WINDOW_SIZE = 6;        // N
const THRESHOLD = 0.6;        // CV threshold
const MIN_EXITS = WINDOW_SIZE + 1;

export function computeEfficiency(exitTimes) {
  if (!exitTimes || exitTimes.length < MIN_EXITS) {
    return { limitTime: null };
  }

  // Compute deltas Δt[i] = t[i] - t[i-1]
  const deltas = [];
  for (let i = 1; i < exitTimes.length; i++) {
    deltas.push(exitTimes[i] - exitTimes[i - 1]);
  }

  // Slide window over deltas
  for (let i = WINDOW_SIZE - 1; i < deltas.length; i++) {
    // W[i] = last N deltas
    const window = deltas.slice(i - WINDOW_SIZE + 1, i + 1);

    // mu = mean(W)
    let sum = 0;
    for (let k = 0; k < window.length; k++) sum += window[k];
    const mu = sum / WINDOW_SIZE;

    // Guard: invalid mean
    if (mu <= 0) continue;

    // sigma = std(W)
    let variance = 0;
    for (let k = 0; k < window.length; k++) {
      const d = window[k] - mu;
      variance += d * d;
    }
    variance /= WINDOW_SIZE;
    const sigma = Math.sqrt(variance);

    // CV = sigma / mu
    const CV = sigma / mu;

    // First exceed only (one-time trigger)
    if (CV > THRESHOLD) {
      // limitTime fixed at corresponding exit_time
      // deltas[i] corresponds to exitTimes[i + 1]
      return { limitTime: exitTimes[i + 1] };
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

  // No limit: full green bar
  if (!limitTime) {
    ctx.fillStyle = "#2DBE60";
    ctx.fillRect(0, y, width, barHeight);
    ctx.restore();
    return;
  }

  const xLimit = timeToX(limitTime);

  // Green before limit
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, xLimit, barHeight);

  // Red vertical marker (limit)
  ctx.strokeStyle = "#E53935";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(xLimit + 0.5, y);
  ctx.lineTo(xLimit + 0.5, y + barHeight);
  ctx.stroke();

  // Grey after limit
  ctx.fillStyle = "#B0B0B0";
  ctx.fillRect(xLimit, y, width - xLimit, barHeight);

  ctx.restore();
}
