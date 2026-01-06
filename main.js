const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

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
}

function render() {
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // ТЕСТ: две вертикальные линии
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(16, cssHeight);
  ctx.moveTo(cssWidth - 16, 0);
  ctx.lineTo(cssWidth - 16, cssHeight);
  ctx.stroke();

  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
