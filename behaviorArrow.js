/* behaviorArrow.js */
/* speedometer-style behavior arrow */

export function drawBehaviorArrow(ctx, {
  width,
  height,
  value,      // normalized [-1 .. +1]
  frozen      // boolean
}) {
  const cx = 28;
  const cy = height * 0.5;

  const shaftLen = 96;   // long needle
  const hubR = 6;
  const maxAngle = Math.PI / 4; // +-45deg
  const angle = Math.max(-1, Math.min(1, value)) * maxAngle;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  /* needle */
  ctx.strokeStyle = frozen
    ? "rgba(0,0,0,0.18)"
    : "rgba(0,0,0,0.28)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(shaftLen, 0);
  ctx.stroke();

  /* needle tip */
  ctx.beginPath();
  ctx.moveTo(shaftLen, 0);
  ctx.lineTo(shaftLen - 10, -4);
  ctx.moveTo(shaftLen, 0);
  ctx.lineTo(shaftLen - 10, 4);
  ctx.stroke();

  /* hub */
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, hubR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
