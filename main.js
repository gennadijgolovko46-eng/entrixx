/* ===============================
   ENTRIXX — MIRROR (MAIN)
   =============================== */

/* ===== CONFIG ===== */
const POINT_SIZE = 6;
const BASE_Y = 0.78;
const SCALE_Y = 0.45;
const SPREAD_X = 14;

/* ===== DATA (test) ===== */
const points = [
  { x: 0.25, blue: 0.55, green: 0.75 },
  { x: 0.50, blue: 0.40, green: 0.60 },
  { x: 0.75, blue: 0.70, green: 0.90 }
];

/* ===== CANVAS ===== */
const canvas = document.getElementById("layer1");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  points.forEach(p => {
    const cx = p.x * canvas.width;
    const baseY = BASE_Y * canvas.height;

    const blueY  = baseY - p.blue  * SCALE_Y * canvas.height;
    const greenY = baseY - p.green * SCALE_Y * canvas.height;

    /* blue tail (left) */
    ctx.strokeStyle = "rgba(40,90,255,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - SPREAD_X, baseY);
    ctx.lineTo(cx - SPREAD_X, blueY);
    ctx.stroke();

    /* green tail (right) */
    ctx.strokeStyle = "rgba(80,170,120,0.45)";
    ctx.beginPath();
    ctx.moveTo(cx + SPREAD_X, baseY);
    ctx.lineTo(cx + SPREAD_X, greenY);
    ctx.stroke();

    /* base point */
    ctx.fillStyle = "#000";
    ctx.fillRect(
      cx - POINT_SIZE / 2,
      baseY - POINT_SIZE / 2,
      POINT_SIZE,
      POINT_SIZE
    );
  });
}

draw();
