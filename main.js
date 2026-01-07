import { createTimeMapper } from "./time.js";
import { computeMarket } from "./market.js";

/* ===============================
   CANVAS SETUP
   =============================== */

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let cssWidth = 0;
let cssHeight = 0;
let mapper = null;

/* ===============================
   PARAMETERS
   =============================== */

const MARKET_WINDOW_HOURS = 8;

const LIMIT_WINDOW = 3;
const LIMIT_THRESHOLD = 600;
const FADE_OPACITY = 0.25;

/* behavior */
const SMOOTH = 0.15;
const BEHAVIOR_SCALE = 0.5;

/* ===============================
   RESIZE
   =============================== */

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  cssWidth = rect.width;
  cssHeight = rect.height;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  mapper = createTimeMapper("2026-01-06", cssWidth, 16);
}

/* ===============================
   UTIL
   =============================== */

function variance(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, v) => s + (v - mean) * (v - mean), 0) / arr.length;
}

/* ===============================
   DATA (PROBE)
   =============================== */

/* trades: EXIT-BASED */
let trades = [
  { time: "2026-01-06T09:10:00Z", side: "long",  exit_price: 100 },
  { time: "2026-01-06T09:18:00Z", side: "long",  exit_price: 102 },
  { time: "2026-01-06T09:40:00Z", side: "short", exit_price: 105 },
  { time: "2026-01-06T12:00:00Z", side: "long",  exit_price: 110 },
  { time: "2026-01-06T12:01:30Z", side: "long",  exit_price: 112 },
  { time: "2026-01-06T12:02:10Z", side: "short", exit_price: 111 },
  { time: "2026-01-06T16:20:00Z", side: "long",  exit_price: 115 }
].map(t => ({
  ...t,
  ts: Date.parse(t.time)
}));

/* minute OHLC mock */
let ohlc = [];
let t0 = Date.parse("2026-01-06T09:00:00Z");
let price = 100;

for (let i = 0; i < 600; i++) {
  let high = price + Math.random() * 5;
  let low  = price - Math.random() * 5;
  let close = low + Math.random() * (high - low);

  ohlc.push({
    ts: t0 + i * 60 * 1000,
    open: price,
    high,
    low,
    close
  });

  price = close;
}

/* ===============================
   MARKET ATTACH
   =============================== */

trades = computeMarket(trades, ohlc);

/* ===============================
   LIMIT DETECTOR
   =============================== */

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

/* ===============================
   DRAW ATOM
   =============================== */

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

/* ===============================
   BEHAVIOR LINE
   =============================== */

function drawBehavior(trades, limitTime) {
  let value = 0;
  let smooth = 0;
  let first = true;

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  trades.forEach(t => {
    if (limitTime && t.ts > limitTime) return;

    const delta = (t.hold || 0) - (t.market || 0);
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

/* ===============================
   RENDER
   =============================== */

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

    drawAtom(x, y, t.hold || 0, t.market || 0, alpha);
  });

  requestAnimationFrame(render);
}

/* ===============================
   START
   =============================== */

window.addEventListener("resize", resize);

resize();
render();
