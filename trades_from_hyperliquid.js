const HL = "https://api.hyperliquid.xyz/info";

async function post(body){
  const r = await fetch(HL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  return r.json();
}

async function getAllFills(user){
  let all = [];
  let endTime = Date.now();

  while(true){
    const res = await post({
      type: "userFills",
      user,
      endTime,
      limit: 1000
    });

    if(!res || res.length === 0) break;

    all = all.concat(res);
    endTime = res[0].time - 1;

    if(res.length < 1000) break;
  }

  return all;
}

function groupFills(fills){
  const trades=[];
  const open={};

  fills.sort((a,b)=>a.time-b.time);

  for(const f of fills){
    const sym=f.coin;
    const side=f.side;
    const px=Number(f.px);
    const t=f.time;

    if(!open[sym]){
      open[sym]={side,px,t};
    }else{
      const o=open[sym];
      if(o.side!==side){
        trades.push({
          entry_time:o.t,
          exit_time:t,
          entry_price:o.px,
          exit_price:px,
          dir:o.side==="B"?1:-1
        });
        open[sym]=null;
      }
    }
  }
  return trades;
}

export async function loadTradesFromHyperliquid(user){
  const fills = await getAllFills(user);
  return groupFills(fills);
}
