const HL = "https://api.hyperliquid.xyz/info";
const DAY = 86400000;

async function post(body){
  const r = await fetch(HL,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(body)
  });
  if(!r.ok) throw new Error("HL error");
  return r.json();
}

// Get all fills for a specific day
async function getFills(account, dayUTC){
  return post({
    type:"userFills",
    user: account,
    startTime: dayUTC,
    endTime: dayUTC + DAY
  });
}

// Convert fills → ENTRIXX atoms
function groupFills(fills){
  const trades=[];
  const open={};

  fills.sort((a,b)=>a.time-b.time);

  for(const f of fills){
    const sym = f.coin;
    const side = f.side;     // "B" or "S"
    const px = Number(f.px);
    const t = f.time;

    if(!open[sym]){
      open[sym] = { side, t, px };
    }else{
      const o = open[sym];
      if(o.side !== side){
        trades.push({
          entry_time: o.t,
          exit_time: t,
          entry_price: o.px,
          exit_price: px,
          dir: o.side === "B" ? 1 : -1
        });
        open[sym] = null;
      }
    }
  }
  return trades;
}

// PUBLIC API
export async function loadTradesFromHyperliquid(account, dayUTC){
  const fills = await getFills(account, dayUTC);
  return groupFills(fills);
}
