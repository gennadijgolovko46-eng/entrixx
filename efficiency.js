export function computeEfficiency(exits){
  if(!exits.length) return {limitTime:null};

  exits.sort((a,b)=>a-b);
  const mean = exits.reduce((a,b)=>a+b,0)/exits.length;
  const std = Math.sqrt(exits.reduce((s,x)=>s+(x-mean)**2,0)/exits.length);
  const cv = std / mean;

  if(cv < 0.35) return { limitTime: null };

  const idx = Math.floor(exits.length * 0.15);
  return { limitTime: exits[idx] };
}

export function drawEfficiencyLayer(ctx,{dayStart,dayEnd,limitTime,width,height}){
  if(!limitTime) return;

  const x = ((limitTime - dayStart)/(dayEnd-dayStart))*width;
  ctx.fillStyle="rgba(255,0,0,0.08)";
  ctx.fillRect(x,0,width-x,height);
}
