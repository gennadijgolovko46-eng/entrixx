import { fetchUserFills } from "./hyperliquid.js";

/*
Output format:
[
  {
    entry_time,
    exit_time,
    entry_price,
    exit_price,
    dir,            // 1 long, -1 short
    liquidation     // true/false
  }
]
*/

export async function loadTradesFromHyperliquid(wallet) {
  const fills = await fetchUserFills(wallet);

  const open = {};
  const trades = [];

  for (const f of fills) {
    const id = f.oid;        // position id
    const price = Number(f.px);
    const time = f.time;

    if (!open[id]) {
      open[id] = {
        entry_time: time,
        entry_price: price,
        dir: f.side === "A" ? 1 : -1
      };
    }

    if (f.endPosition === 0) {
      trades.push({
        entry_time: open[id].entry_time,
        exit_time: time,
        entry_price: open[id].entry_price,
        exit_price: price,
        dir: open[id].dir,
        liquidation: f.type === "liquidation"
      });
      delete open[id];
    }
  }

  return trades.sort((a, b) => a.exit_time - b.exit_time);
}
