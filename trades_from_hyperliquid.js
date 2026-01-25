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

// ===== SAFE WINDOW (60 days sliding) =====
const HISTORY_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

const WINDOW_MS = HISTORY_DAYS * DAY_MS; // 60d
const LEAD_MS   = 7 * DAY_MS;           // 7d backfill for proper trade open/close
const MAX_FILLS = 8000;
const MAX_TRADES = 5000;

export async function loadDataFromHyperliquid(account) {
  const acc = String(account || "").trim();
  if (!acc) return { fills: [], trades: [] };

  const now = Date.now();

  // Safe-mode params (activate ONLY when passed)
  const url =
    `${API}/trades` +
    `?account=${encodeURIComponent(acc)}` +
    `&scope=coin` +
    `&t=${now}` +
    `&windowMs=${WINDOW_MS}` +
    `&leadMs=${LEAD_MS}` +
    `&maxFills=${MAX_FILLS}` +
    `&maxTrades=${MAX_TRADES}`;

  const r = await fetch(url, { method: "GET" });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} while fetching trades\n${text.slice(0, 200)}`);
  }

  const j = await r.json();
  const trades = Array.isArray(j?.trades) ? j.trades : [];

  // stabilize order by exit time (seconds/ms safe)
  trades.sort((a, b) => toMs(a.exit_time) - toMs(b.exit_time));

  return { fills: [], trades };
}
