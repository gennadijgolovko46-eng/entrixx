// efficiency.js — Efficiency Layer V2 (stable, locked)

// ---- CONFIG ----
const CV_THRESHOLD = 0.55;        // main sensitivity
const CONFIRM_RATIO = 0.9;        // second-step confirmation
const MIN_TOTAL_EXITS = 7;        // hard minimum

// adaptive window bounds
const WINDOW_MIN = 5;
const WINDOW_MAX = 9;

// ---- HELPERS ----
function mean(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function std(arr, mu) {
  let v = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - mu;
    v += d * d;
  }
  return Math.sqrt(v / arr.length);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function adaptiveWindowSize(totalExits) {
  const n = Math.round(Math.log2(totalExits) + 3);
  return clamp(n, WINDOW_MIN, WINDOW_MAX);
}

// ---- CORE ----
export function computeEfficiency(exitTimes) {
  if (!exitTimes || exitTimes.length < MIN_TOTAL_EXITS) {
    return { limitTime: null };
  }

  const deltas = [];
  for (let i = 1; i < exitTimes.length; i++) {
    deltas.push(exitTimes[i] - exitTimes[i - 1]);
  }

  let limitTime = null;

  for (let i = 0; i < deltas.length - 1; i++) {
    if (limitTime !== null) break;

    const totalExits = i + 2;
    const N = adaptiveWindowSize(totalExits);

    if (totalExits < Math.max(N + 2, MIN_TOTAL_EXITS)) continue;
    if (i < N - 1) continue;

    const w1 = deltas.slice(i - N + 1, i + 1);
    const mu1 = mean(w1);
    if (mu1 <= 0) continue;

    const cv1 = std(w1, mu1) / mu1;
    if (cv1 <= CV_THRESHOLD) continue;

    const w2 = deltas.slice(i - N + 2, i + 2);
    const mu2 = mean(w2);
    if (mu2 <= 0) continue;

    const cv2 = std(w2, mu2) / mu2;
    if (cv2 <= CV_THRESHOLD * CONFIRM_RATIO) continue;

    limitTime = exitTimes[i + 1];
  }

  return { limitTime };
}

// ---- DRAWING ----
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

  // no limit -> full green, nothing else
  if (!limitTime) {
    ctx.fillStyle = "#2DBE60";
    ctx.fillRect(0, y, width, barHeight);
    ctx.restore();
    return;
  }

  const xLimit = timeToX(limitTime);

  // green before
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, xLimit, barHeight);

  // red vertical line (full screen)
  ctx.strokeStyle = "#D10000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(xLimit + 0.5, 0);
  ctx.lineTo(xLimit + 0.5, height);
  ctx.stroke();

  // grey after
  ctx.fillStyle = "#B0B0B0";
  ctx.fillRect(xLimit, y, width - xLimit, barHeight);

  ctx.restore();
}
