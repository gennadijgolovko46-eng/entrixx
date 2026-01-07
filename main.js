<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>ENTRIXX — Mirror</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
}
canvas {
  display: block;
}
#back {
  position: fixed;
  bottom: 18px;
  right: 18px;
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: rgba(0,0,0,0.45);
  cursor: pointer;
}
</style>
</head>
<body>

<canvas id="canvas"></canvas>
<div id="back">back</div>

<script>
/* ===============================
   CONFIG
   =============================== */
const ATOM_SIZE = 6;        // square size
const SCALE = 2;            // visual scale for tails
const MIN_TAIL = ATOM_SIZE; // minimum visible tail
const CENTER_LINE = true;

/* ===============================
   CANVAS
   =============================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ===============================
   SAMPLE DATA (PROBE)
   hold   = result of trade
   market = market move after entry
   =============================== */
const atoms = [
  { x: 0.35, y: 0.55, hold: 3,  market: 18 },
  { x: 0.37, y: 0.56, hold: 1,  market: 14 },
  { x: 0.39, y: 0.57, hold: 6,  market: 22 },
  { x: 0.50, y: 0.55, hold: 2,  market: 26 },
  { x: 0.62, y: 0.56, hold: 1,  market: 9  }
];

/* ===============================
   HELPERS
   =============================== */
function scaledTail(value) {
  if (value === 0) return 0;
  const v = Math.abs(value * SCALE);
  return Math.max(v, MIN_TAIL) * Math.sign(value);
}

/* ===============================
   DRAW ATOM
   =============================== */
function drawAtom(atom) {
  const x = atom.x * canvas.width;
  const y = atom.y * canvas.height;

  const holdTail = scaledTail(atom.hold);
  const marketTail = scaledTail(atom.market);

  // HOLD (blue)
  ctx.strokeStyle = "#2b6cff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x - 2, y - holdTail);
  ctx.stroke();

  // MARKET (green)
  ctx.strokeStyle = "#2fb56f";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 2, y - marketTail);
  ctx.stroke();

  // BODY (black square)
  ctx.fillStyle = "#000000";
  ctx.fillRect(
    x - ATOM_SIZE / 2,
    y - ATOM_SIZE / 2,
    ATOM_SIZE,
    ATOM_SIZE
  );
}

/* ===============================
   DRAW
   =============================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // center line (time divider)
  if (CENTER_LINE) {
    ctx.strokeStyle = "rgba(200,0,0,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
  }

  atoms.forEach(drawAtom);
}

draw();

/* ===============================
   NAV
   =============================== */
document.getElementById("back").onclick = () => {
  window.location.href = "/";
};
</script>

</body>
</html>
