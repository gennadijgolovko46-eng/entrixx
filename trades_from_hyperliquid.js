// Single data gateway via Cloudflare Worker
const HL = "https://entrixx.gennadijgolovko46.workers.dev";

async function post(body) {
  const r = await fetch(HL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    throw new Error("Hyperliquid proxy error");
  }

  return r.json();
}

async function getFills(account) {
  return post({
    type: "userFills",
    user: account
  });
}

/*
  Atomic trade = entry -> exit
  No partial fill inference
*/
function groupFills(fills) {
  const trades = [];
  const open = {};

  fills.sort((a, b) => a.time - b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side; // "B" or "S"
    const px = Number(f.px);
    const t = f.time;

    if (!open[sym]) {
      open[sym] = { side, t, px };
      continue;
    }

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

  return trades;
}

export async function loadTradesFromHyperliquid(account) {
  const fills = await getFills(account);
  return groupFills(fills);
}
