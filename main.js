"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W = 0, H = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* TEST DATA */
const atoms = [
  { x: 0.30, hold: 90, market: 140 },
  { x: 0.50, hold: 70, market: 110 },
  { x: 0.70, hold: 110, market: 160 }
];

function draw() {
  ctx.clearRect(0, 0, W, H);

  const baseY = Math.floor(H * 0.75);

  atoms.forEach(a => {
    const cx = Math.floor(a.x * W);

    /* blue (left) */
    ctx.strokeStyle = "rgba(40,90,255,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 3, baseY);
    ctx.lineTo(cx - 3, baseY - a.hold);
    ctx.stroke();

    /* green (right) */
    ctx.strokeStyle = "rgba(40,170,120,0.6)";
    ctx.beginPath();
    ctx.moveTo(cx + 3, baseY);
    ctx.lineTo(cx + 3, baseY - a.market);
    ctx.stroke();

    /* body */
    ctx.fillStyle = "#000";
    ctx.fillRect(cx - 3, baseY - 3, 6, 6);
  });

  requestAnimationFrame(draw);
}

draw();
