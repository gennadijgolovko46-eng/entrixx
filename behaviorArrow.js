// behaviorArrow.js
// Behavior indicator:
// "You control the market — or the market controls you."
// Visuals unchanged. Meaning stabilized.

const CX = 28;
const MAX_ANGLE = Math.PI / 4; // ±45°

const LEN = 96;
const BASE_W = 6;
const TIP_W = 1.2;
const AXIS_R = 6;

// --- visual inertia (instrument-like) ---
let _angle = 0;
let _angleInit = false;

// 0.10–0.18: higher = more reactive, lower = more stable
const SMOOTH = 0.12;

// dead zone around neutral to prevent jitter near balance
const DEAD_ZONE = 0.06;

// --- gradient cache (no visual change) ---
let _gradLive = null;
let _gradFrozen = null;
let _gradReady = false;

function getGradient(ctx, frozen) {
  if (!_gradReady) {
    const live = ctx.createLinearGradient(0, 0, LEN, 0);
    live.addColorStop(0, "rgba(140,140,140,0.45)");
    live.addColorStop(1, "rgba(160,160,160,0.35)");
    _gradLive = live;

    const frozenGrad = ctx.createLinearGradient(0, 0, LEN, 0);
    frozenGrad.addColorStop(0, "rgba(140,140,140,0.30)");
    frozenGrad.addColorStop(1, "rgba(160,160,160,0.20)");
    _gradFrozen = frozenGrad;

    _gradReady = true;
  }
  return frozen ? _gradFrozen : _gradLive;
}

function clamp(min, v, max) {
  return Math.max(min, Math.min(max, v));
}

export function drawBehaviorArrow(ctx, {
  value,   // normalized [-1..1]
  frozen,
  width,
  height
}) {
  const cy = height * 0.5;

  // normalize input
  let v = Number(value);
  if (!Number.isFinite(v)) v = 0;
  v = clamp(-1, v, 1);

  // neutral balance zone
  if (Math.abs(v) < DEAD_ZONE) v = 0;

  // meaning:
  // up   -> you control the market
  // down -> the market controls you
  const target = v * MAX_ANGLE;

  // smooth (purely visual)
  if (!_angleInit) {
    _angle = target;
    _angleInit = true;
  } else {
    _angle += (target - _angle) * SMOOTH;
  }

  const angle = clamp(-MAX_ANGLE, _angle, MAX_ANGLE);

  ctx.save();
  ctx.translate(CX, cy);
  ctx.rotate(angle);

  // axis
  ctx.fillStyle = frozen
    ? "rgba(120,120,120,0.25)"
    : "rgba(120,120,120,0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, AXIS_R, 0, Math.PI * 2);
  ctx.fill();

  // wedge arrow
  ctx.fillStyle = getGradient(ctx, frozen);
  ctx.beginPath();
  ctx.moveTo(0, -BASE_W / 2);
  ctx.lineTo(LEN, -TIP_W / 2);
  ctx.lineTo(LEN,  TIP_W / 2);
  ctx.lineTo(0,  BASE_W / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Call on day/account change to avoid carry-over inertia
export function resetBehaviorArrow() {
  _angleInit = false;
}
