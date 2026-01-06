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

    const times = [
      "2026-01-06T09:10:00Z",
      "2026-01-06T09:18:00Z",
      "2026-01-06T09:40:00Z",
      "2026-01-06T12:00:00Z",
      "2026-01-06T12:01:30Z",
      "2026-01-06T16:20:00Z"
    ];

    times.forEach((iso, i) => {
      const t = new Date(iso).getTime();
      const x = mapper.timeToX(t);

      // small vertical separation to avoid overlap
      const y = cssHeight / 2 + (i % 3) * 8;

      drawAtom(
        x,
        y,
        40 + i * 10,
        20 + i * 5
      );
    });
  }

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
