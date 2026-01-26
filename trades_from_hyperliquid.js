// trades_from_hyperliquid.js
//
// Frontend contract:
// loadDataFromHyperliquid(account) -> { fills: [], trades: [...] }

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

// seconds/ms normalization
function toMs(v){
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return (n > 0 && n < 1e12) ? n * 1000 : n;
}

// client-side timeout to prevent UI hanging
const FETCH_TIMEOUT_MS = 12000;

export async function loadDataFromHyperliquid(account) {
  const acc = String(account || "").trim();
  if (!acc) return { fills: [], trades: [] };

  // CACHE BUSTER — CRITICAL
  const url =
    `${API}/trades` +
    `?account=${encodeURIComponent(acc)}` +
    `&scope=coin` +
    `&_=${Date.now()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let r;
  try {
    r = await fetch(url, { method: "GET", signal: controller.signal });
  } catch (e) {
    throw new Error(
      e?.name === "AbortError"
        ? `Timeout ${FETCH_TIMEOUT_MS}ms`
        : "Network error"
    );
  } finally {
    clearTimeout(timer);
  }

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status}\n${text.slice(0,200)}`);
  }

  const j = await r.json();
  const trades = Array.isArray(j?.trades) ? j.trades : [];

  // stable order
  trades.sort((a,b) => toMs(a.exit_time) - toMs(b.exit_time));

  return { fills: [], trades };
}
