/* ===============================
   ENTRIXX — MAIN (SAFE RESET)
   =============================== */

(function () {
  "use strict";

  // ---- CANVAS ----
  const canvas = document.getElementById("canvas");
  if (!canvas) {
    console.error("Canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  // ---- CLEAR ----
  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ---- SAFE DRAW LOOP ----
  function draw() {
    clear();

    // атомы (если есть)
    if (typeof window.drawAtoms === "function") {
      try { window.drawAtoms(ctx); } catch (e) { console.error(e); }
    }

    // рынок (если есть)
    if (typeof window.drawMarket === "function") {
      try { window.drawMarket(ctx); } catch (e) { console.error(e); }
    }

    // линия поведения (если есть)
    if (typeof window.drawBehavior === "function") {
      try { window.drawBehavior(ctx); } catch (e) { console.error(e); }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
