// trades_from_hyperliquid.js
// Load real trades from Hyperliquid for a wallet and a UTC day

const HL_ENDPOINT = "https://api.hyperliquid.xyz/info";
const DAY_MS = 86400000;

async function post(body) {
  const res = await fetch(HL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("HL request failed");
  return res.json();
}

// Fetch all fills for wallet
async function fetchFills(wallet) {
  return post({
    type: "userFills",
    user: wallet
  });
}

// Group fills into trades (entry -> exit)
function groupFillsToTrades(fills) {
  const trades = [];
  const stack = {};

  // sort by time
  fills.sort((a, b) => a.time - b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side; // "B" or "S"
    const time = f.time;
    const price = Number(f.px);

    if (!stack[sym]) stack[sym] = null;

    if (!stack[sym]) {
      // open
      stack[sym] = { side, time, price };
    } else {
      // close
      const open = stack[sym];
      if (open.side !== side) {
        trades.push({
          entry_time: open.time,
          exit_time: time,
          entry_price: open.price,
          exit_price: price,
          dir: open.side === "B" ? 1 : -1
        });
        stack[sym] = null;
      }
    }
  }
  return trades;
}

// Filter trades by UTC day
function filterByDay(trades, dayUTC) {
  const start = dayUTC;
  const end = dayUTC + DAY_MS;
  return trades.filter(t =>
    t.exit_time >= start && t.exit_time < end
  );
}

// PUBLIC API
export async function loadTradesFromHyperliquid(wallet, dayUTC) {
  const fills = await fetchFills(wallet);
  const trades = groupFillsToTrades(fills);
  return filterByDay(trades, dayUTC);
}
