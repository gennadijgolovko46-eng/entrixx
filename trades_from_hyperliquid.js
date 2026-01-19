// Single data gateway via Cloudflare Worker
// All data now comes from YOUR backend, not Hyperliquid directly

const WORKER = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

/*
  Load fills from worker storage
*/
async function getFills(account) {
  const r = await fetch(
    `${WORKER}/fills?account=${account}&limit=500`
  );

  if (!r.ok) {
    throw new Error("Worker fills fetch failed");
  }

  const j = await r.json();
  return j.fills || [];
}

/*
  Atomic trade = entry -> exit
  Strict alternation per symbol
  No partial fill inference
*/
function groupFills(fills) {
  const trades = [];
  const open = {};

  // chronological order
  fills.sort((a, b) => a.time - b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side;
    const px = Number(f.px);
    const t = f.time;

    if (!open[sym]) {
      open[sym] = { side, t, px };
      continue;
    }

    const o = open[sym];

    // opposite side closes trade
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

/*
  Public API for UI
  Returns:
  {
    fills: [...],
    trades: [...]
  }
*/
export async function loadDataFromHyperliquid(account) {
  const fills = await getFills(account);
  const trades = groupFills(fills);
  return { fills, trades };
}
