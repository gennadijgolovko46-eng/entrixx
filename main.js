import { createTimeMapper } from "./time.js";

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let cssWidth = 0;
let cssHeight = 0;
let mapper = null;

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

function drawAtom(x, y, hold, market) {
  const ATOM = 6;

  // атом
  ctx.fillStyle = "#000";
  ctx.fillRect(x - ATOM / 2, y - ATOM / 2, ATOM, ATOM);

  ctx.lineWidth = 1;

  // HOLD — синий (левее)
  ctx.strokeStyle = "#2F6BFF";
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - hold);
  ctx.stroke();

  // MARKET — зелёный (правее)
  ctx.strokeStyle = "#2DBE60";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - market);
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  if (mapper) {
    // ось времени
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

    // ОДИН ТЕСТОВЫЙ АТОМ
    const t = new Date("2026-01-06T12:00:00Z").getTime();
    const x = mapper.timeToX(t);
    const y = cssHeight / 2;

    drawAtom(x, y, 80, 40);
  }

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
