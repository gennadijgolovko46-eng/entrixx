/* ===============================
   ENTRIXX — MAIN (DIAGNOSTIC SAFE)
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
  if (!ctx) {
    console.error("Context not found");
    return;
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  // ---- CLEAR ----
  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ---- DRAW LOOP ----
  function draw() {
    clear();

    // === DIAGNOSTIC MARK ===
    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 120, 120);

    // optional layers (safe)
    if (typeof window.drawDensityLayer === "function") {
      try { window.drawDensityLayer(ctx); } catch (e) {}
    }

    if (typeof window.drawAtoms === "function") {
      try { window.drawAtoms(ctx); } catch (e) {}
    }

    if (typeof window.drawMarket === "function") {
      try { window.drawMarket(ctx); } catch (e) {}
    }

    if (typeof window.drawBehavior === "function") {
      try { window.drawBehavior(ctx); } catch (e) {}
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
