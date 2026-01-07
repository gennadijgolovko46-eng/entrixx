import { createTimeMapper } from "./time.js";

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let cssWidth = 0;
let cssHeight = 0;
let mapper = null;

const LIMIT_WINDOW = 3;        // sliding window size
const LIMIT_THRESHOLD = 600;  // seconds variance threshold
const FADE_OPACITY = 0.25;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  cssWidth = rect.width;
  cssHeight = rect.height;

  canvas.width  = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  mapper = createTimeMapper("2026-01-06", cssWidth, 16);
}

/* ---------- UTIL ---------- */

function variance(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, v) => s + (v - mean) * (v - mean), 0) / arr.length;
}

/* ---------- ATOM ---------- */

function drawAtom(x, y, hold, market, alpha = 1) {
  const ATOM_SIZE = 6;

  ctx.globalAlpha = alpha;

  ctx.fillStyle = "#000";
  ctx.fillRect(
    x - ATOM_SIZE / 2,
    y - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );

  ctx.lineWidth = 1;

  ctx.strokeStyle = "#2F6BFF";
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - hold);
  ctx.stroke();

  ctx.strokeStyle = "#2DBE60";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - market);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

/* ---------- TEST DATA ---------- */

const trades = [
  "2026-01-06T09:10:00Z",
  "2026-01-06T09:18:00Z",
  "2026-01-06T09:40:00Z",
  "2026-01-06T12:00:00Z",
  "2026-01-06T12:01:30Z",
  "2026-01-06T12:02:10Z",
  "2026-01-06T16:20:00Z"
].map(t => Date.parse(t));

/* ---------- LIMIT DETECTOR ---------- */

function detectLimit(times) {
  let deltas = [];
  for (let i = 1; i < times.length; i++) {
    deltas.push((times[i] - times[i - 1]) / 1000);
    if (deltas.length >= LIMIT_WINDOW) {
      const v = variance(deltas.slice(-LIMIT_WINDOW));
      if (v > LIMIT_THRESHOLD) {
        return times[i];
      }
    }
  }
  return null;
}

/* ---------- RENDER ---------- */

function render() {
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  if (!mapper) {
    requestAnimationFrame(render);
    return;
  }

  const limitTime = detectLimit(trades);

  const xStart = mapper.timeToX(mapper.dayStart);
  const xEnd   = mapper.timeToX(mapper.dayEnd);

  // state bar
  if (limitTime) {
    const xLimit = mapper.timeToX(limitTime);

    ctx.fillStyle = "#2DBE60";
    ctx.fillRect(xStart, cssHeight - 10, xLimit - xStart, 10);

    ctx.fillStyle = "#B0B0B0";
    ctx.fillRect(xLimit, cssHeight - 10, xEnd - xLimit, 10);

    ctx.strokeStyle = "#E53935";
    ctx.beginPath();
    ctx.moveTo(xLimit, 0);
    ctx.lineTo(xLimit, cssHeight);
    ctx.stroke();
  }

  trades.forEach((t, i) => {
    const x = mapper.timeToX(t);
    const y = cssHeight / 2 + (i % 3) * 8;

    const alpha =
      limitTime && t > limitTime ? FADE_OPACITY : 1;

    drawAtom(
      x,
      y,
      40 + i * 5,
      30 + i * 4,
      alpha
    );
  });

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
