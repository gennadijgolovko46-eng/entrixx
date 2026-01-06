import { createTimeMapper } from "./time.js";

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let mapper = null;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width  = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // фиксируем день (пока захардкожен)
  mapper = createTimeMapper("2026-01-06", rect.width, 16);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // тест: рисуем край дня
  if (mapper) {
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;

    const xStart = mapper.timeToX(mapper.dayStart);
    const xEnd   = mapper.timeToX(mapper.dayEnd);

    ctx.beginPath();
    ctx.moveTo(xStart, 0);
    ctx.lineTo(xStart, canvas.height);
    ctx.moveTo(xEnd, 0);
    ctx.lineTo(xEnd, canvas.height);
    ctx.stroke();
  }

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
