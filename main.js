/* ===============================
   ENTRIXX — MAIN (ATOMS DEMO)
   =============================== */

(function () {
  "use strict";

  // ---- CANVAS ----
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  // ---- DEMO DATA ----
  const atoms = [
    { x: 0.30, y: 0.55, hold: 3, market: 18 },
    { x: 0.34, y: 0.56, hold: 1, market: 14 },
    { x: 0.38, y: 0.57, hold: 6, market: 22 },
    { x: 0.52, y: 0.55, hold: 2, market: 26 },
    { x: 0.66, y: 0.56, hold: 1, market: 9 }
  ];

  const ATOM_SIZE = 6;
  const TAIL_SCALE = 2;
  const MIN_TAIL = ATOM_SIZE;

  function scaleTail(v) {
    if (!v) return 0;
    const abs = Math.abs(v * TAIL_SCALE);
    return Math.max(abs, MIN_TAIL) * Math.sign(v);
  }

  function drawAtom(a) {
    const x = a.x * canvas.width;
    const y = a.y * canvas.height;

    const hold = scaleTail(a.hold);
    const market = scaleTail(a.market);

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

    ctx.fillStyle = "#000";
    ctx.fillRect(
      x - ATOM_SIZE / 2,
      y - ATOM_SIZE / 2,
      ATOM_SIZE,
      ATOM_SIZE
    );
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function render() {
    clear();
    atoms.forEach(drawAtom);
    requestAnimationFrame(render);
  }

  render();
})();
