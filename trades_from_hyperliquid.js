// trades_from_hyperliquid.js

const API = "https://eze-fa50.gennadijgolovko46.workers.dev";

async function fetchJsonHard(url) {
  const r = await fetch(url, { method: "GET" });
  const text = await r.text();

  if (!r.ok) {
    throw new Error(`HTTP ${r.status} for ${url}\n\n${text.slice(0, 400)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `BAD JSON for ${url}\n\nFirst 400 chars:\n${text.slice(0, 400)}`
    );
  }
}

export async function loadDataFromHyperliquid(account) {
  const acc = String(account || "").trim();
  if (!acc) return { fills: [], trades: [] };

  const url = `${API}/trades?account=${encodeURIComponent(acc)}&scope=coin`;
  const j = await fetchJsonHard(url);

  const trades = Array.isArray(j?.trades) ? j.trades : [];
  return { fills: [], trades };
}
