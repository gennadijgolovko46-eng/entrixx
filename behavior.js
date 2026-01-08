// behavior.js — Behavior Line V1 (locked)

/*
Inputs (strict):
- trades: array of trades sorted by exit_time
  {
    entry_time: ms,
    exit_time: ms | null,
    hold_price: number,     // HOLD in price units
    market_price: number    // MARKET in price units (8h window)
  }
- limitTime: ms | null
*/

const CLAMP = 1; // fixed global constant (price units)

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function computeBehavior(trades, limitTime) {
  let acc = 0;
  const points = [];

  for (let i = 0; i < trades.length; i++) {
    const t = trades[i];
    if (!t.exit_time) continue;
    if (limitTime && t.exit_time > limitTime) break;

    const delta = (t.hold_price ?? 0) - (t.market_price ?? 0);
    const smoothed = clamp(delta, -CLAMP, CLAMP);

    acc += smoothed;
    points.push({
      time: t.exit_time,
      value: acc
    });
  }

  return points;
}

export function drawBehaviorLine(ctx, points, timeToX, baseY) {
  if (!points || points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < points.length; i++) {
    const x = timeToX(points[i].time);
    const y = baseY - points[i].value;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.restore();
}
