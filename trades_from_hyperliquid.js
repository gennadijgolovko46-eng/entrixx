const HL = "https://api.hyperliquid.xyz/info";

async function post(body) {
  const r = await fetch(HL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error("HL request failed");
  return r.json();
}

// account → fills
async function getFills(account) {
  return post({
    type: "userFills",
    user: account
  });
}

// fills → ENTRIXX trades
function groupFills(fills) {
  const trades = [];
  const open = {};

  fills.sort((a,b)=>a.time-b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side;
    const px = Number(f.px);

    // normalize Hyperliquid time (sec or ms → ms)
    const t = f.time > 1e12 ? f.time : f.time * 1000;

    if (!open[sym]) {
      open[sym] = { side, t, px };
    } else {
      const o = open[sym];
      if (o.side !== side) {
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
export async function loadTradesFromHyperliquid(account) {
  const fills = await getFills(account);
  return groupFills(fills);
}
