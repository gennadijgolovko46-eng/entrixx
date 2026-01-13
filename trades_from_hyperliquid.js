const HL = "https://api.hyperliquid.xyz/info";

async function post(body){
  const r = await fetch(HL,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  if(!r.ok) throw new Error("HL error");
  return r.json();
}

async function getFills(account){
  return post({ type:"userFills", user: account });
}

/*
Turns raw fills into atomic trades:
entry_time, exit_time, entry_price, exit_price, dir
dir = +1 (long) or -1 (short)
*/
function groupFills(fills){
  const trades = [];
  const open = {};

  fills.sort((a,b)=>a.time - b.time);

  for(const f of fills){
    const sym  = f.coin;
    const side = f.side;   // "B" or "S"
    const px   = Number(f.px);
    const t    = f.time;

    if(!open[sym]){
      open[sym] = { side, t, px };
    } else {
      const o = open[sym];
      if(o.side !== side){
        trades.push({
          entry_time:  o.t,
          exit_time:   t,
          entry_price: o.px,
          exit_price:  px,
          dir:         o.side === "B" ? 1 : -1
        });
        open[sym] = null;
      }
    }
  }
  return trades;
}

export async function loadTradesFromHyperliquid(account){
  const fills = await getFills(account);
  return groupFills(fills);
}
