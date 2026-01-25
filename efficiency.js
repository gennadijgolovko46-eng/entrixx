// Efficiency Layer — FINAL (patched: factual limitTime + outlier guard + adaptive window)

const WINDOW_SIZE = 6;
const THRESHOLD_CV = 0.45;
const MIN_WINDOW = 3; // minimum deltas window to avoid noise

/*
Computes when rhythm breaks.
limitTime is the time of the last stable atom (FACT, not forecast).
Adaptive window: uses min(WINDOW_SIZE, deltas.length), but never below MIN_WINDOW.
*/
export function computeEfficiency(exitTimes){
  if(!exitTimes || exitTimes.length < (MIN_WINDOW + 1)){
    // Need at least MIN_WINDOW deltas => MIN_WINDOW + 1 exits
    return { limitTime: null };
  }

  const deltas = [];
  for(let i=1;i<exitTimes.length;i++){
    deltas.push(exitTimes[i] - exitTimes[i-1]);
  }

  const WS = Math.min(WINDOW_SIZE, deltas.length);
  if(WS < MIN_WINDOW){
    return { limitTime: null };
  }

  for(let i=WS-1;i<deltas.length;i++){
    const window = deltas.slice(i-WS+1, i+1);

    const mean = window.reduce((s,v)=>s+v,0) / window.length;
    if(mean <= 0) continue;

    let variance = 0;
    for(const v of window){
      const d = v - mean;
      variance += d*d;
    }
    variance /= window.length;

    const sigma = Math.sqrt(variance);
    const cv = sigma / mean;

    // Outlier guard: require the last pause to "break" (big spike)
    const lastDelta = window[window.length - 1];

    if(cv > THRESHOLD_CV && lastDelta > mean * 2){
      // i is a delta index; exitTimes[i+1] is the exit time at the end of that delta
      return { limitTime: exitTimes[i+1] };
    }
  }

  return { limitTime: null };
}

/*
Draws bottom efficiency bar + red vertical cut
*/
export function drawEfficiencyLayer(ctx, opts){
  const {
    dayStart,
    dayEnd,
    limitTime,
    width,
    height,
    barHeight = 6
  } = opts;

  const y = height - barHeight;

  function timeToX(t){
    return ((t - dayStart) / (dayEnd - dayStart)) * width;
  }

  ctx.save();

  if(!limitTime){
    ctx.fillStyle = "#2DBE60";
    ctx.fillRect(0, y, width, barHeight);
    ctx.restore();
    return;
  }

  const xLimit = timeToX(limitTime);

  // green
  ctx.fillStyle = "#2DBE60";
  ctx.fillRect(0, y, xLimit, barHeight);

  // red vertical line (full screen)
  ctx.strokeStyle = "#D10000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(xLimit + 0.5, 0);
  ctx.lineTo(xLimit + 0.5, height);
  ctx.stroke();

  // grey
  ctx.fillStyle = "#B0B0B0";
  ctx.fillRect(xLimit, y, width - xLimit, barHeight);

  ctx.restore();
}
