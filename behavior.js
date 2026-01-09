export function drawBehaviorArrow(ctx,{angle,frozen,height}){
  const x=28;
  const y=height*0.5;
  const len=22;
  const maxA=Math.PI/4;
  const a=Math.max(-maxA,Math.min(maxA,angle));

  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(a);

  ctx.strokeStyle=frozen?"rgba(0,0,0,0.25)":"rgba(0,0,0,0.35)";
  ctx.lineWidth=2;
  ctx.lineCap="round";

  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(len,0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(len,0);
  ctx.lineTo(len-6,-3);
  ctx.moveTo(len,0);
  ctx.lineTo(len-6,3);
  ctx.stroke();

  ctx.restore();

  ctx.fillStyle=frozen?"rgba(0,0,0,0.25)":"rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.arc(x,y,2.5,0,Math.PI*2);
  ctx.fill();
}
