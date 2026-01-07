(function () {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // BIG RED RECT — impossible to miss
  ctx.fillStyle = "red";
  ctx.fillRect(50, 50, 300, 300);

  // BLACK TEXT
  ctx.fillStyle = "black";
  ctx.font = "20px sans-serif";
  ctx.fillText("MAIN.JS LOADED", 60, 380);
})();
