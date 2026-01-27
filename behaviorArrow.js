// behaviorArrow.js
// Honest & useful behavior arrow (LEFT/RIGHT gauge)
// - Does NOT use tails / market_window
// - Expects `value` in [-1..1] from index (computeBehavior)
//   value < 0 => market controls you (LEFT / amber)
//   value = 0 => neutral (UP / gray)
//   value > 0 => you control the market (RIGHT / teal)
// - "Honesty": intensity & thickness follow |value|
// - Ultra-safe: clamps, NaN guards, try/catch, no deps

function clamp(min, v, max) {
  return Math.max(min, Math.min(max, v));
}
function finiteOr(v, fallback) {
  return Number.isFinite(v) ? v : fallback;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Visual only: stronger response near edges, gentle near center
function easeOut(v) {
  const s = clamp(-1, v, 1);
  const a = Math.abs(s);
  const e = 1 - Math.pow(1 - a, 2.2);
  return Math.sign(s) * e;
}

// Color: amber (-1) -> gray (0) -> teal (+1)
function valueToColor(v) {
  const x = clamp(-1, finiteOr(v, 0), 1);

  // -1: (255,191,0)
  //  0: (180,180,180)
  // +1: (45,180,170)
  let r, g, b;

  if (x < 0) {
    const t = Math.abs(x);
    r = lerp(180, 255, t);
    g = lerp(180, 191, t);
    b = lerp(180,   0, t);
  } else {
    const t = x;
    r = lerp(180,  45, t);
    g = lerp(180, 180, t);
    b = lerp(180, 170, t);
  }

  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export function drawBehaviorArrow(ctx, { value, frozen, width, height }) {
  // ABSOLUTE SAFETY: never throw, never break render loop
  try {
    if (!ctx || typeof ctx.save !== "function") return;

    const W = finiteOr(width, 0);
    const H = finiteOr(height, 0);
    if (!(W > 0 && H > 0)) return;

    // Placement
    const cx = W * 0.5;
    const cy = H - 74; // above date
    const R = 54;

    const raw = clamp(-1, finiteOr(value, 0), 1);
    const eased = easeOut(raw);

    // If frozen => tone down intensity (UI only)
    const frozenK = frozen ? 0.65 : 1.0;

    // CONFIDENCE = |value|
    const conf = clamp(0, Math.abs(raw), 1);

    // LEFT/RIGHT mapping across semicircle:
    // left end = π, top = 1.5π, right end = 2π
    const TOP = Math.PI * 1.5;
    const MAX_SWEEP = Math.PI * 0.5;
    const angle = TOP + eased * MAX_SWEEP;

    const color = valueToColor(raw);

    const arcAlpha = frozen ? 0.05 : 0.07;
    const baseAlpha = lerp(0.22, 0.95, conf) * frozenK;
    const glowAlpha = lerp(0.10, 0.55, conf) * frozenK;
    const arrowAlpha = lerp(0.20, 0.92, conf) * frozenK;

    ctx.save();
    ctx.translate(cx, cy);

    // --- arc ---
    ctx.beginPath();
    ctx.arc(0, 0, R, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = `rgba(0,0,0,${arcAlpha})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // --- ticks ---
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.lineWidth = 2;

    function tick(atAngle, len) {
      const x0 = Math.cos(atAngle) * (R - len);
      const y0 = Math.sin(atAngle) * (R - len);
      const x1 = Math.cos(atAngle) * (R + 2);
      const y1 = Math.sin(atAngle) * (R + 2);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    tick(Math.PI, 10);
    tick(TOP, 14);
    tick(Math.PI * 2, 10);
    ctx.restore();

    // --- sector fill ---
    if (raw !== 0) {
      ctx.save();
      ctx.globalAlpha = baseAlpha * 0.25;
      ctx.fillStyle = color;

      const a0 = TOP;
      const a1 = TOP + raw * MAX_SWEEP;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R - 7, a0, a1, raw < 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // --- hub ---
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = frozen
      ? "rgba(120,120,120,0.22)"
      : "rgba(120,120,120,0.30)";
    ctx.fill();

    // --- needle ---
    ctx.save();
    ctx.rotate(angle - TOP);

    const needleLen = 62;
    const needleW = lerp(3.0, 7.0, conf);

    // glow
    ctx.globalAlpha = glowAlpha;
    ctx.shadowBlur = lerp(0, 18, conf);
    ctx.shadowColor = color;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, -needleLen);
    ctx.lineTo( needleW, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(-needleW, 0);
    ctx.closePath();
    ctx.fill();

    // solid
    ctx.globalAlpha = arrowAlpha;
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(0, -needleLen);
    ctx.lineTo( needleW * 0.85, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-needleW * 0.85, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  } catch (_) {
    return;
  }
}
