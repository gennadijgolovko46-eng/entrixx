// trades_from_hyperliquid.js

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";
const DEFAULT_WINDOW_MS = 8 * 60 * 60 * 1000; // 8h

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

async function fetchMarketWindow(coin, exitTime, cache, windowMs = DEFAULT_WINDOW_MS) {
  const key = `${coin}:${exitTime}:${windowMs}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const r = await fetch(
      `${API}/market_window?coin=${encodeURIComponent(coin)}&t=${exitTime}&windowMs=${windowMs}`
    );
    if (!r.ok) return null;

    const j = await r.json();
    const v = { hi: num(j.hi), lo: num(j.lo) };
    cache.set(key, v);
    return v;
  } catch (_) {
    return null;
  }
}

async function attachMarketExtremes(trades) {
  const cache = new Map();
  const out = trades.map(t => ({ ...t, mkt_up: NaN, mkt_dn: NaN }));

  // build tasks
  const tasks = [];
  for (let i = 0; i < out.length; i++) {
    const t = out[i];
    const coin = String(t.coin || "").trim();
    const exitTime = num(t.exit_time);
    if (!coin || !Number.isFinite(exitTime)) continue;

    tasks.push({ i, coin, exitTime });
  }

  // limited concurrency
  const CONCURRENCY = 6;
  let p = 0;

  async function worker() {
    while (p < tasks.length) {
      const k = p++;
      const { i, coin, exitTime } = tasks[k];
      const v = await fetchMarketWindow(coin, exitTime, cache, DEFAULT_WINDOW_MS);
      if (v) {
        if (Number.isFinite(v.hi)) out[i].mkt_up = v.hi;
        if (Number.isFinite(v.lo)) out[i].mkt_dn = v.lo;
      }
    }
  }

  const runners = Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker);
  await Promise.all(runners);

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
