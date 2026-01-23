// trades_from_hyperliquid.js

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

function num(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : NaN;
}

async function loadTrades(account) {
  const acc = String(account || "").trim();
  if (!acc) return [];

  const r = await fetch(`${API}/trades?account=${encodeURIComponent(acc)}`);
  if (!r.ok) throw new Error("trades fetch failed");

  const j = await r.json();
  return (j && Array.isArray(j.trades)) ? j.trades : [];
}

async function attachMarketExtremes(trades) {
  const cache = new Map(); // key = `${coin}:${exit_time}` -> {hi,lo}
  const out = [];

  for (const t of trades) {
    const coin = String(t.coin || "").trim();
    const exitTime = num(t.exit_time);

    let mkt_up = NaN;
    let mkt_dn = NaN;

    if (coin && Number.isFinite(exitTime)) {
      const key = `${coin}:${exitTime}`;
      let v = cache.get(key);

      if (!v) {
        try {
          const r = await fetch(
            `${API}/market_window?coin=${encodeURIComponent(coin)}&t=${exitTime}`
          );
          if (r.ok) {
            const j = await r.json();
            v = { hi: num(j.hi), lo: num(j.lo) };
            cache.set(key, v);
          }
        } catch (_) {}
      }

      if (v) {
        if (Number.isFinite(v.hi)) mkt_up = v.hi;
        if (Number.isFinite(v.lo)) mkt_dn = v.lo;
      }
    }

    out.push({ ...t, mkt_up, mkt_dn });
  }

  return out;
}

export async function loadDataFromHyperliquid(account) {
  const trades = await loadTrades(account);
  const withMarket = await attachMarketExtremes(trades);

  return {
    fills: [],
    trades: withMarket,
  };
}
