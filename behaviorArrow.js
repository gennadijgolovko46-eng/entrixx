// behaviorArrow.js
// Behavior Arrow — SAFE + VERTICAL (up/down), zero-deps, no side effects.
// Contract: drawBehaviorArrow(ctx, { value, frozen, width, height })
// value must be normalized [-1..1] by index (computeBehavior). We only render.

export function drawBehaviorArrow(ctx, { value, frozen, width, height }) {
  // ---- hard safety (never throw) ----
  try {
    if (!ctx || !Number.isFinite(width) || !Number.isFinite(height)) return;

    // normalize + clamp
    const v0 = Number(value);
    const v = Number.isFinite(v0) ? Math.max(-1, Math.min(1, v0)) : 0;

    // Placement: centered horizontally, near bottom (as you requested)
    const cx = width * 0.5;
    const cy = height - 70; // bottom anchor, above date line
    const radius = 44;

    // Vertical behavior: UP = +1 (you control), DOWN = -1 (market controls)
    const MAX_ANGLE = Math.PI / 2; // 90 degrees total range
    const angle = (-v) * MAX_ANGLE; // v>0 => rotate upward (negative angle in canvas)

    // Visual tuning (kept minimal, safe)
    const alpha = frozen ? 0.28 : 0.80;
    const strokeAlpha = frozen ? 0.10 : 0.18;

    // Color: negative -> amber, zero -> gray, positive -> teal (useful, not tied to tails)
    function mix(a, b, t) { return a + (b - a) * t; }
    function rgb(r, g, b) {
      r = Math.round(Math.max(0, Math.min(255, r)));
      g = Math.round(Math.max(0, Math.min(255, g)));
      b = Math.round(Math.max(0, Math.min(255, b)));
      return `rgb(${r},${g},${b})`;
    }

    let col;
    if (v < 0) {
      // gray -> amber as v goes 0..-1
      const t = Math.min(1, Math.max(0, -v));
      col = rgb(
        mix(180, 255, t),   // r
        mix(180, 191, t),   // g
        mix(180,   0, t)    // b
      );
    } else {
      // gray -> teal as v goes 0..+1
      const t = Math.min(1, Math.max(0, v));
      col = rgb(
        mix(180,  45, t),   // r
        mix(180, 180, t),   // g
        mix(180, 170, t)    // b
      );
    }

    ctx.save();

    // ---- subtle gauge arc (bottom semi-circle) ----
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = `rgba(0,0,0,${strokeAlpha})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // ---- center hub ----
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = frozen ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.12)";
    ctx.fill();

    // ---- arrow needle (diamond pointer) ----
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;

    // mild glow only when not frozen (keeps it readable but not heavy)
    if (!frozen) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = col;
    } else {
      ctx.shadowBlur = 0;
    }

    // Needle geometry (vertical, pointing up when v=+1)
    // Tip goes to -radius; small diamond near center.
    const tipY = -radius;
    const baseY = 10;

    ctx.beginPath();
    ctx.moveTo(0, tipY);      // tip
    ctx.lineTo(5, 0);         // right mid
    ctx.lineTo(0, baseY);     // bottom
    ctx.lineTo(-5, 0);        // left mid
    ctx.closePath();
    ctx.fill();

    // ---- optional tiny neutral tick at center (helps read "0") ----
    ctx.globalAlpha = frozen ? 0.16 : 0.22;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.stroke();

    ctx.restore();
  } catch (_) {
    // absolute safety: never break index render loop
    return;
  }
}
