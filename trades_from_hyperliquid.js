// trades_from_hyperliquid.js
//
// Frontend contract:
// loadDataFromHyperliquid(account) -> { fills: [], trades: [...] }
//
// IMPORTANT FIX:
// Do NOT fetch *.workers.dev from the browser.
// Always fetch same-origin (entrixx.xyz) and let the backend/worker proxy it.
// This avoids "TypeError: Failed to fetch" caused by cross-origin blocks.

function sameOriginApiBase() {
  // Always current site origin, e.g. https://entrixx.xyz
  return location.origin;
}

async function fetchJsonHard(url) {
  // no-cors is WRONG (it returns opaque), so we don't use it.
  const r = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
    // credentials not needed for public endpoints; keep it default
  });

  const text = await r.text();

  if (!r.ok) {
    throw new Error(`HTTP ${r.status} for ${url}\n\n${text.slice(0, 400)}`);
  }

  // Some CDNs may serve HTML on errors with 200; catch JSON issues explicitly
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

  // SAME ORIGIN ENDPOINT:
  // This must exist on your deployed backend/worker on entrixx.xyz:
  // GET /trades?account=...&scope=coin
  const API = sameOriginApiBase();
  const url = `${API}/trades?account=${encodeURIComponent(acc)}&scope=coin`;

  const j = await fetchJsonHard(url);

  const trades = Array.isArray(j?.trades) ? j.trades : [];
  return { fills: [], trades };
}
