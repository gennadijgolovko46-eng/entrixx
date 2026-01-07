/* ===============================
   ENTRIXX — MIRROR
   main.js (stable)
   =============================== */

const canvas = document.getElementById("layer1");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

/* test atoms */
const atoms = [
  { x: 0.25, y: 0.85, hold: 0.12 },
  { x: 0.50, y: 0.85, hold: 0.07 },
  { x: 0.75, y: 0.85, hold: 0.16 }
];

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  atoms.forEach(a => {
    const x = a.x * window.innerWidth;
    const y = a.y * window.innerHeight;
    const holdPx = a.hold * window.innerHeight;

    /* green tail */
    ctx.beginPath();
    ctx.strokeStyle = "rgba(120,180,150,0.45)";
    ctx.lineWidth = 1;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - holdPx);
    ctx.stroke();

    /* blue tail */
    ctx.beginPath();
    ctx.strokeStyle = "rgba(40,90,255,0.45)";
    ctx.lineWidth = 1;
    ctx.moveTo(x + 2, y);
    ctx.lineTo(x + 2, y - holdPx * 0.8);
    ctx.stroke();

    /* decision point */
    ctx.fillStyle = "#000";
    ctx.fillRect(x - 2, y - 2, 4, 4);
  });
}

draw();
