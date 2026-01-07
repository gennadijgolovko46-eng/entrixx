(function () {
  "use strict";

  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  // ---- SAMPLE ATOMS ----
  const atoms = [
    { x: 0.35, y: 0.55, hold: 40, market: 90 },
    { x: 0.45, y: 0.56, hold: 20, market: 45 },
    { x: 0.55, y: 0.54, hold: 60, market: 120 }
  ];

  function drawAtom(a) {
    const x = a.x * canvas.width;
    const y = a.y * canvas.height;

    // hold tail (left)
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.moveTo(x - 2, y);
    ctx.lineTo(x - 2, y - a.hold);
    ctx.stroke();

    // market tail (right)
    ctx.strokeStyle = "rgba(0,160,80,0.35)";
    ctx.beginPath();
    ctx.moveTo(x + 2, y);
    ctx.lineTo(x + 2, y - a.market);
    ctx.stroke();

    // body
    ctx.fillStyle = "#000";
    ctx.fillRect(x - 3, y - 3, 6, 6);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    atoms.forEach(drawAtom);
    requestAnimationFrame(render);
  }

  render();
})();
