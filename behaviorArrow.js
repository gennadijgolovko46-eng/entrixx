// behaviorArrow.js
// Draws a gauge-like wedge arrow (automotive style)

export function drawBehaviorArrow(ctx, {
  value,        // normalized value in range [-1..1]
  frozen,       // boolean
  width,
  height
}) {
  const cx = 28;              // anchor from left
  const cy = height * 0.5;    // vertical center

  const MAX_ANGLE = Math.PI / 4;   // ±45°
  const angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, value * MAX_ANGLE));

  const LEN = 96;             // arrow length (≈2x previous)
  const BASE_W = 6;           // base thickness
  const TIP_W = 1.2;          // tip thickness

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // ---- axis circle ----
  ctx.fillStyle = frozen
    ? "rgba(120,120,120,0.25)"
    : "rgba(120,120,120,0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // ---- wedge arrow ----
  const grad = ctx.createLinearGradient(0, 0, LEN, 0);
  grad.addColorStop(0, frozen
    ? "rgba(140,140,140,0.30)"
    : "rgba(140,140,140,0.45)");
  grad.addColorStop(1, frozen
    ? "rgba(160,160,160,0.20)"
    : "rgba(160,160,160,0.35)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -BASE_W / 2);
  ctx.lineTo(LEN, -TIP_W / 2);
  ctx.lineTo(LEN,  TIP_W / 2);
  ctx.lineTo(0,  BASE_W / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
