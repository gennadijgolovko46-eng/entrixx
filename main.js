import { createTimeMapper } from "./time.js";
import { drawAtom } from "./atom.js";

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let mapper = null;
let cssWidth = 0;
let cssHeight = 0;

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

function render() {
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // ось времени
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

    // ТЕСТОВЫЙ АТОМ
    const testTime = new Date("2026-01-06T12:00:00Z").getTime();
    const x = mapper.timeToX(testTime);
    const y = cssHeight / 2;

    drawAtom(ctx, x, y, 80, 40);
  }

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
