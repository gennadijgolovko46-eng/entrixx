const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

async function getFills(account) {
  const r = await fetch(
    `${API}/fills?account=${account}&limit=1000`
  );
  if (!r.ok) throw new Error("fills fetch failed");
  const j = await r.json();
  return j.fills || [];
}

function groupFills(fills) {
  const trades = [];
  const open = {};

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

export async function loadDataFromHyperliquid(account) {
  const fills = await getFills(account);
  const trades = groupFills(fills);
  return { fills, trades };
}
