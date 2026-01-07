(function () {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (window.drawAtoms) {
      window.drawAtoms(ctx);
    }

    requestAnimationFrame(render);
  }

  render();
})();
