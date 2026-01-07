window.drawAtoms = function (ctx) {
  const x = 200;
  const y = 300;

  // blue tail
  ctx.strokeStyle = "rgba(40,90,255,0.45)";
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - 60);
  ctx.stroke();

  // green tail
  ctx.strokeStyle = "rgba(60,180,120,0.45)";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - 120);
  ctx.stroke();

  // body
  ctx.fillStyle = "#000";
  ctx.fillRect(x - 3, y - 3, 6, 6);
};
