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

// client-side timeout to prevent UI hanging
const FETCH_TIMEOUT_MS = 12000;

export async function loadDataFromHyperliquid(account) {
  const acc = String(account || "").trim();
  if (!acc) return { fills: [], trades: [] };

  const url = `${API}/trades?account=${encodeURIComponent(acc)}&scope=coin`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let r;
  try {
    r = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });
  } catch (e) {
    const msg =
      e && e.name === "AbortError"
        ? `Timeout ${FETCH_TIMEOUT_MS}ms while fetching trades`
        : `Network error while fetching trades`;
    throw new Error(msg);
  } finally {
    clearTimeout(timer);
  }

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} while fetching trades\n${text.slice(0, 200)}`);
  }

  const j = await r.json();
  const trades = Array.isArray(j?.trades) ? j.trades : [];

  // stabilize order by exit time
  trades.sort((a, b) => toMs(a.exit_time) - toMs(b.exit_time));

  return { fills: [], trades };
}
