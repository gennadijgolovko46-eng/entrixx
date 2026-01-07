import { createTimeMapper } from "./time.js";

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let cssWidth = 0;
let cssHeight = 0;
let mapper = null;

/* ----- PARAMETERS ----- */

const LIMIT_WINDOW = 3;
const LIMIT_THRESHOLD = 600;
const FADE_OPACITY = 0.25;

/* behavior tuning (readability only) */
const SMOOTH = 0.15;          // less smoothing
const BEHAVIOR_SCALE = 0.5;   // stronger vertical response

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

/* ---------- DATA (PROBE) ---------- */

const trades = [
  { time: "2026-01-06T09:10:00Z", hold: 30, market: 50 },
  { time: "2026-01-06T09:18:00Z", hold: 25, market: 40 },
  { time: "2026-01-06T09:40:00Z", hold: 20, market: 35 },
  { time: "2026-01-06T12:00:00Z", hold: 40, market: 60 },
  { time: "2026-01-06T12:01:30Z", hold: 15, market: 50 },
  { time: "2026-01-06T12:02:10Z", hold: 10, market: 45 },
  { time: "2026-01-06T16:20:00Z", hold: 50, market: 55 }
].map(t => ({
  ...t,
  ts: Date.parse(t.time)
}));

/* ---------- LIMIT ---------- */

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

/* ---------- ATOM ---------- */

function drawAtom(x, y, hold, market, alpha = 1) {
  const ATOM = 6;

  ctx.globalAlpha = alpha;

  ctx.fillStyle = "#000";
  ctx.fillRect(x - ATOM / 2, y - ATOM / 2, ATOM, ATOM);

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

/* ---------- BEHAVIOR LINE ---------- */

function drawBehavior(trades, limitTime) {
  let value = 0;
  let smooth = 0;
  let first = true;

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  trades.forEach(t => {
    if (limitTime && t.ts > limitTime) return;

    const delta = t.hold - t.market;
    smooth = smooth * (1 - SMOOTH) + delta * SMOOTH;
    value += smooth;

    const x = mapper.timeToX(t.ts);
    const y = cssHeight / 2 + value * BEHAVIOR_SCALE;

    if (first) {
      ctx.moveTo(x, y);
      first = false;
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

/* ---------- RENDER ---------- */

function render() {
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  if (!mapper) {
    requestAnimationFrame(render);
    return;
  }

  const times = trades.map(t => t.ts);
  const limitTime = detectLimit(times);

  const xStart = mapper.timeToX(mapper.dayStart);
  const xEnd   = mapper.timeToX(mapper.dayEnd);

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

  drawBehavior(trades, limitTime);

  trades.forEach((t, i) => {
    const x = mapper.timeToX(t.ts);
    const y = cssHeight / 2 + (i % 3) * 8;

    const alpha =
      limitTime && t.ts > limitTime ? FADE_OPACITY : 1;

    drawAtom(x, y, t.hold, t.market, alpha);
  });

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
