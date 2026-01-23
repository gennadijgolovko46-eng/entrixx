// trades_from_hyperliquid.js
//
// Frontend contract:
// loadDataFromHyperliquid(account) -> { fills: [], trades: [...] }
//
// This module ONLY loads trades from main worker:
// - GET /trades?account=...&scope=coin
// Market extremes (/market_window) are handled by index.html (hydrateMarketForDay).

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

export async function loadDataFromHyperliquid(account) {
  const acc = String(account || "").trim();
  if (!acc) return { fills: [], trades: [] };

  const r = await fetch(`${API}/trades?account=${encodeURIComponent(acc)}&scope=coin`);
  if (!r.ok) throw new Error("trades fetch failed");

  const j = await r.json();
  const trades = (j && Array.isArray(j.trades)) ? j.trades : [];

  return { fills: [], trades };
}
