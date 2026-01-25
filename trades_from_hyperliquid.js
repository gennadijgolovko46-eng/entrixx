// trades_from_hyperliquid.js
//
// Frontend contract:
// loadDataFromHyperliquid(account) -> { fills: [], trades: [...] }

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

// seconds/ms normalization (same as index)
function toMs(v){
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return (n > 0 && n < 1e12) ? n * 1000 : n;
}

// MIN FIX: limit request to last 60 days to prevent overload
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 60 * DAY_MS;

export async function loadDataFromHyperliquid(account) {
  const acc = String(account || "").trim();
  if (!acc) return { fills: [], trades: [] };

  const url =
    `${API}/trades?account=${encodeURIComponent(acc)}&scope=coin` +
    `&t=${Date.now()}` +
    `&windowMs=${WINDOW_MS}`;

  const r = await fetch(url, { method: "GET" });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} while fetching trades\n${text.slice(0, 200)}`);
  }

  const j = await r.json();
  const trades = Array.isArray(j?.trades) ? j.trades : [];

  // Optional: stabilize order by exit time
  trades.sort((a, b) => toMs(a.exit_time) - toMs(b.exit_time));

  return { fills: [], trades };
}
