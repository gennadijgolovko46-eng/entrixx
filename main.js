import { createTimeMapper } from "./time.js";
import { computeMarket } from "./market.js";
import { computeHold } from "./hold.js";
import "./layer-density.js";

/* ===============================
   CANVAS
   =============================== */

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let cssWidth = 0;
let cssHeight = 0;
let mapper = null;

/* ===============================
   PARAMETERS
   =============================== */

const TAIL_SCALE = 2;
const ATOM_SIZE = 6;

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

let trades = [
  { time: "2026-01-06T09:10:00Z", side: "long",  entry_price: 95,  exit_price: 100 },
  { time: "2026-01-06T09:18:00Z", side: "long",  entry_price: 98,  exit_price: 102 },
  { time: "2026-01-06T09:40:00Z", side: "short", entry_price: 108, exit_price: 105 },
  { time: "2026-01-06T12:00:00Z", side: "long",  entry_price: 105, exit_price: 110 },
  { time: "2026-01-06T12:01:30Z", side: "long",  entry_price: 108, exit_price: 112 },
  { time: "2026-01-06T12:02:10Z", side: "short", entry_price: 114, exit_price: 111 },
  { time: "2026-01-06T16:20:00Z", side: "long",  entry_price: 110, exit_price: 115 }
].map(t => ({ ...t, ts: Date.parse(t.time) }));

/* minute OHLC mock */

let ohlc = [];
let t0 = Date.parse("2026-01-06T09:00:00Z");
let price = 95;

for (let i = 0; i < 600; i++) {
  let high = price + Math.random() * 6;
  let low  = price - Math.random() * 6;
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
   ATTACH HOLD + MARKET
   =============================== */

trades = computeHold(trades);
trades = computeMarket(trades, ohlc);

/* ===============================
   LIMIT
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
  ctx.globalAlpha = alpha;

  ctx.strokeStyle = "#2F6BFF";
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - hold * TAIL_SCALE);
  ctx.stroke();

  ctx.strokeStyle = "#2DBE60";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - market * TAIL_SCALE);
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.fillRect(
    x - ATOM_SIZE / 2,
    y - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );

  ctx.globalAlpha = 1;
}

/* ===============================
   BEHAVIOR LINE
   =============================== */

function drawBehavior(atoms, limitTime) {
  let value = 0;
  let smooth = 0;
  let first = true;

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  atoms.forEach(a => {
    if (limitTime && a.time > limitTime) return;

    const delta = a.hold - a.market;
    smooth = smooth * (1 - SMOOTH) + delta * SMOOTH;
    value += smooth;

    const y = cssHeight / 2 + value * BEHAVIOR_SCALE;

    if (first) {
      ctx.moveTo(a.x, y);
      first = false;
    } else {
      ctx.lineTo(a.x, y);
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

  const atoms = trades.map((t, i) => {
    const x = mapper.timeToX(t.ts);
    const y = cssHeight / 2 + (i % 3) * 8;
    return {
      x,
      y,
      time: t.ts,
      hold: t.hold,
      market: t.market,
      break: false
    };
  });

  /* density layer */
  drawDensity(ctx, atoms);

  /* behavior line */
  drawBehavior(atoms, limitTime);

  /* atoms */
  atoms.forEach((a, i) => {
    const alpha =
      limitTime && a.time > limitTime ? FADE_OPACITY : 1;
    drawAtom(a.x, a.y, a.hold, a.market, alpha);
  });

  requestAnimationFrame(render);
}

/* ===============================
   START
   =============================== */

window.addEventListener("resize", resize);

resize();
render();
