const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

/*
  Loads canonical trades from worker.
  Frontend does NOT build trades from fills.
  Worker is the single source of truth.
*/
async function loadTrades() {
  const r = await fetch(`${API}/trades`, {
    method: "GET"
  });

  if (!r.ok) {
    throw new Error("trades fetch failed");
  }

  const j = await r.json();

  if (j && Array.isArray(j.trades)) {
    return j.trades;
  }

  return [];
}

/*
  Public API expected by index.html:
  loadDataFromHyperliquid(account) -> { fills, trades }

  fills are intentionally empty here.
*/
export async function loadDataFromHyperliquid(account) {
  const trades = await loadTrades();
  return {
    fills: [],
    trades
  };
}
