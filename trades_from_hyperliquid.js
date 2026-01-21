// trades_from_hyperliquid.js (целиком, со вставками DEBUG)

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

async function getFills(account) {
  const r = await fetch(`${API}/fills?account=${account}&limit=1000`);
  if (!r.ok) throw new Error("fills fetch failed");
  const j = await r.json();
  return j.fills || [];
}

function groupFills(fills) {
  const trades = [];
  const open = {};

  // DEBUG: исходный объём
  console.log("DEBUG groupFills: input fills =", fills?.length ?? 0);

  fills.sort((a, b) => a.time - b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side;          // "B" или "A"
    const px = Number(f.px);
    const t = f.time;

    // DEBUG: пропуск мусора/нечисел
    if (!sym || (side !== "B" && side !== "A") || !Number.isFinite(px) || !Number.isFinite(t)) {
      continue;
    }

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

      // ВАЖНО: сброс позиции
      open[sym] = null;
    }
  }

  // DEBUG: итог
  console.log("DEBUG groupFills: output trades =", trades.length);

  return trades;
}

export async function loadDataFromHyperliquid(account) {
  const fills = await getFills(account);

  // DEBUG: сколько реально пришло с API
  console.log("DEBUG loadData: fills =", fills.length);

  const trades = groupFills(fills);

  // DEBUG: сколько собралось trades
  console.log("DEBUG loadData: trades =", trades.length);

  return { fills, trades };
}
