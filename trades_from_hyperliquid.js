// trades_from_hyperliquid.js
const API = "https://eze-fa50.gennadijgolovko46.workers.dev";

export async function loadDataFromHyperliquid(account) {
  const acc = String(account || "").trim();
  if (!acc) return { fills: [], trades: [] };

  const url = `${API}/trades?account=${encodeURIComponent(acc)}&scope=coin`;

  const r = await fetch(url);
  if (!r.ok) {
    throw new Error(`HTTP ${r.status} while fetching trades`);
  }

  const j = await r.json();
  const trades = Array.isArray(j?.trades) ? j.trades : [];

  return { fills: [], trades };
}
