import { createTimeMapper } from "./time.js";

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let cssWidth = 0;
let cssHeight = 0;
let mapper = null;

const MARKET_WINDOW_MS = 8 * 60 * 60 * 1000;

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

/* ---------- MARKET CALC ---------- */

function calcMarketDelta(exitTime, exitPrice, side, ohlc) {
  const windowEnd = exitTime + MARKET_WINDOW_MS;

  let best = 0;

  for (let i = 0; i < ohlc.length; i++) {
    const [ts, open, high, low, close] = ohlc[i];

    if (ts < exitTime || ts > windowEnd) continue;

    if (side === "long") {
      best = Math.max(best, high - exitPrice);
    } else {
      best = Math.max(best, exitPrice - low);
    }
  }

  return best;
}

/* ---------- DRAW ---------- */

function drawAtom(x, y, hold, market) {
  const ATOM_SIZE = 6;

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
}

/* ---------- TEST DATA ---------- */

const ohlc = [
  [Date.parse("2026-01-06T12:01:00Z"), 100, 102, 99, 101],
  [Date.parse("2026-01-06T12:10:00Z"), 101, 104, 100, 103],
  [Date.parse("2026-01-06T12:40:00Z"), 103, 105, 101, 102],
  [Date.parse("2026-01-06T13:30:00Z"), 102, 103, 97, 98],
  [Date.parse("2026-01-06T15:00:00Z"), 98, 100, 96, 97]
];

const trades = [
  {
    time: Date.parse("2026-01-06T12:00:00Z"),
    side: "long",
    entry: 98,
    exit: 100
  },
  {
    time: Date.parse("2026-01-06T12:01:30Z"),
    side: "short",
    entry: 102,
    exit: 100
  }
];

/* ---------- RENDER ---------- */

function render() {
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  if (mapper) {
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;

    const xStart = mapper.timeToX(mapper.dayStart);
    const xEnd   = mapper.timeToX(mapper.dayEnd);

    ctx.beginPath();
    ctx.moveTo(xStart, 0);
    ctx.lineTo(xStart, cssHeight);
    ctx.moveTo(xEnd, 0);
    ctx.lineTo(xEnd, cssHeight);
    ctx.stroke();

    trades.forEach((tr, i) => {
      const x = mapper.timeToX(tr.time);
      const y = cssHeight / 2 + i * 14;

      const hold =
        tr.side === "long"
          ? tr.exit - tr.entry
          : tr.entry - tr.exit;

      const market = calcMarketDelta(
        tr.time,
        tr.exit,
        tr.side,
        ohlc
      );

      drawAtom(x, y, hold * 20, market * 20);
    });
  }

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
