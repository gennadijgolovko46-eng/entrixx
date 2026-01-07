const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;
let BASE_Y = 0;

/* ===== CONFIG ===== */
const TAIL_WIDTH = 2;
const DOT_SIZE = 6;

const OFFSET_BLUE = -2;
const OFFSET_GREEN = 2;

/* ===== COLORS ===== */
const COLOR_BLUE = "rgba(40,90,255,0.45)";
const COLOR_GREEN = "rgba(80,170,120,0.45)";
const COLOR_BLACK = "#000";

/* ===== DATA ===== */
let points = [];

/* ===== RESIZE ===== */
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;

  BASE_Y = H * 0.72;

  points = [
    { x: W * 0.30, blue: 110, green: 160 },
    { x: W * 0.50, blue: 80,  green: 120 },
    { x: W * 0.70, blue: 140, green: 180 }
  ];

  draw();
}

window.addEventListener("resize", resize);
resize();

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, W, H);

  points.forEach(p => {
    // BLUE TAIL
    ctx.strokeStyle = COLOR_BLUE;
    ctx.lineWidth = TAIL_WIDTH;
    ctx.beginPath();
    ctx.moveTo(p.x + OFFSET_BLUE, BASE_Y);
    ctx.lineTo(p.x + OFFSET_BLUE, BASE_Y - p.blue);
    ctx.stroke();

    // GREEN TAIL
    ctx.strokeStyle = COLOR_GREEN;
    ctx.beginPath();
    ctx.moveTo(p.x + OFFSET_GREEN, BASE_Y);
    ctx.lineTo(p.x + OFFSET_GREEN, BASE_Y - p.green);
    ctx.stroke();

    // BLACK DOT
    ctx.fillStyle = COLOR_BLACK;
    ctx.fillRect(
      p.x - DOT_SIZE / 2,
      BASE_Y - DOT_SIZE / 2,
      DOT_SIZE,
      DOT_SIZE
    );
  });
}
