/* ===============================
   ENTRIXX — MAIN
   =============================== */

const canvas = document.getElementById("layer1");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}
window.addEventListener("resize", resize);
resize();

/* ===== DATA ===== */
const atoms = [
  { x: 0.25, y: 0.65, hold: 0.22 },
  { x: 0.50, y: 0.65, hold: 0.14 },
  { x: 0.75, y: 0.65, hold: 0.28 }
];

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, W, H);

  atoms.forEach(a => {
    const px = a.x * W;
    const py = a.y * H;
    const h  = a.hold * H;

    /* green tail */
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - h);
    ctx.strokeStyle = "rgba(40,180,120,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* blue tail */
    ctx.beginPath();
    ctx.moveTo(px - 2, py);
    ctx.lineTo(px - 2, py - h * 0.7);
    ctx.strokeStyle = "rgba(40,90,255,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* atom */
    ctx.fillStyle = "#000";
    ctx.fillRect(px - 4, py - 4, 8, 8);
  });

  requestAnimationFrame(draw);
}

draw();
