<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ENTRIXX</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
html,body{
  margin:0;
  padding:0;
  background:#fff;
  overflow:hidden;
}
canvas{display:block}
#date{
  position:fixed;
  bottom:14px;
  left:50%;
  transform:translateX(-50%);
  font:12px system-ui,sans-serif;
  color:rgba(0,0,0,.45)
}
</style>
</head>
<body>

<canvas id="c"></canvas>
<div id="date"></div>

<script type="module">
import { loadDataFromHyperliquid } from "./trades_from_hyperliquid.js";

const ACCOUNT = "0x880ac484a1743862989a441d6d867238c7aa311c";
const DAY = 86400000;

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const dateEl = document.getElementById("date");

let W = 0, H = 0;

function resize(){
  const dpr = devicePixelRatio || 1;
  W = innerWidth;
  H = innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize", resize);
resize();

// -------------------- TIME --------------------

function dayFloorUTC(t){
  const d = new Date(t);
  d.setUTCHours(0,0,0,0);
  return d.getTime();
}

// -------------------- STATE --------------------

let atoms = [];
let days = [];
let dayIndex = 0;

// -------------------- ATOM ADAPTER --------------------

function tradeToAtom(t){
  const HOLD_price =
    t.side === "B"
      ? t.exit_price - t.entry_price
      : t.entry_price - t.exit_price;

  const dUp   = t.market_max - t.exit_price;
  const dDown = t.market_min - t.exit_price;

  const MARKET_price =
    Math.abs(dUp) >= Math.abs(dDown)
      ? dUp
      : dDown;

  return {
    exit_time: t.exit_time,
    side: t.side,
    HOLD_price,
    MARKET_price,
    liquidated: !!t.liquidated
  };
}

// -------------------- FILTER --------------------

function atomsForDay(d0){
  const d1 = d0 + DAY;
  return atoms.filter(a =>
    a.exit_time >= d0 &&
    a.exit_time < d1
  );
}

// -------------------- SCALE --------------------

function computeDayScale(list){
  let maxAbs = 0;
  for(const a of list){
    maxAbs = Math.max(
      maxAbs,
      Math.abs(a.HOLD_price),
      Math.abs(a.MARKET_price)
    );
  }
  return maxAbs || 1;
}

// -------------------- DRAW --------------------

function drawAtom(a, d0, scale){
  const x = ((a.exit_time - d0) / DAY) * W;
  const y = H * 0.55;

  if(a.liquidated){
    ctx.strokeStyle = "#D10000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x-6,y-6); ctx.lineTo(x+6,y+6);
    ctx.moveTo(x-6,y+6); ctx.lineTo(x+6,y-6);
    ctx.stroke();
    return;
  }

  const ATOM_H = 160;
  const EPS = 8;

  const blueLen  = Math.max(Math.abs(a.HOLD_price)   / scale * ATOM_H, EPS);
  const greenLen = Math.abs(a.MARKET_price) / scale * ATOM_H;

  const dirBlue  = a.side === "B" ? -1 : 1;
  const dirGreen = Math.sign(a.MARKET_price);

  ctx.lineWidth = 1.5;

  // blue — decision
  ctx.strokeStyle = "#2F6BFF";
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x,y + dirBlue * blueLen);
  ctx.stroke();

  // green — market
  if(greenLen > 0){
    ctx.strokeStyle = "#2DBE60";
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y + dirGreen * greenLen);
    ctx.stroke();
  }

  // anchor
  ctx.fillStyle = "#000";
  ctx.fillRect(x-2,y-2,4,4);
}

function render(){
  ctx.clearRect(0,0,W,H);

  const d0 = days[dayIndex];
  const list = atomsForDay(d0);
  const scale = computeDayScale(list);

  for(const a of list){
    drawAtom(a, d0, scale);
  }

  requestAnimationFrame(render);
}

// -------------------- INIT --------------------

(async ()=>{
  const data = await loadDataFromHyperliquid(ACCOUNT);

  atoms = data.trades.map(tradeToAtom);

  console.log("ATOMS COUNT:", atoms.length);
  console.log("ATOM SAMPLE:", atoms[0]);

  let minT = Infinity;
  for(const a of atoms){
    minT = Math.min(minT, a.exit_time);
  }

  const start = dayFloorUTC(minT);
  const end   = dayFloorUTC(Date.now());

  for(let d = start; d <= end; d += DAY){
    days.push(d);
  }

  dayIndex = days.length - 1;
  dateEl.textContent = new Date(days[dayIndex]).toDateString();

  render();
})();
</script>
</body>
</html>
