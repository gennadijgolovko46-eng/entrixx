const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width  = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

resize();
render();
