const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";
const W_MARKET = 8 * 60 * 60 * 1000;

async function getFills(account){
  const r = await fetch(`${API}/fills?account=${account}&limit=5000`);
  if(!r.ok) throw new Error("fills fetch failed");
  const j = await r.json();
  return j.fills || [];
}

function groupFills(fills){
  const trades = [];
  const open = {};

  fills.sort((a,b)=>a.time-b.time);

  for(const f of fills){
    const sym = f.coin;
    const side = f.side;
    const px = Number(f.px);
    const t = f.time;

    if(!open[sym]){
      open[sym] = { side, t, px };
      continue;
    }

    const o = open[sym];
    if(o.side !== side){
      trades.push({
        entry_time: o.t,
        exit_time: t,
        entry_price: o.px,
        exit_price: px,
        side: o.side
      });
      open[sym] = null;
    }
  }
  return trades;
}

function attachMarket(trades, fills){
  for(const t of trades){
    const from = t.exit_time;
    const to = from + W_MARKET;

    let maxP = t.exit_price;
    let minP = t.exit_price;

    for(const f of fills){
      if(f.time < from || f.time > to) continue;
      const p = Number(f.px);
      if(p > maxP) maxP = p;
      if(p < minP) minP = p;
    }

    t.market_max = maxP;
    t.market_min = minP;
    t.liquidated = false;
  }
  return trades;
}

export async function loadDataFromHyperliquid(account){
  const fills = await getFills(account);
  const trades = groupFills(fills);
  attachMarket(trades, fills);
  return { trades };
}
