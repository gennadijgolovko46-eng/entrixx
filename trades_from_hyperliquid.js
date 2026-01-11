// trades_from_hyperliquid.js

const HL_ENDPOINT = "https://api.hyperliquid.xyz/info";

// Hyperliquid uses nanoseconds → convert to ms
const NS_TO_MS = 1_000_000;

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

// Group fills into trades (entry → exit)
function groupFillsToTrades(fills) {
  const trades = [];
  const stack = {};

  fills.sort((a, b) => a.time - b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side; // "B" or "S"
    const time = f.time / NS_TO_MS;   // FIX: convert to ms
    const price = Number(f.px);

    if (!stack[sym]) {
      // open
      stack[sym] = { side, time, price };
    } else {
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

// PUBLIC API — returns ALL trades, unfiltered
export async function loadTradesFromHyperliquid(wallet) {
  const fills = await fetchFills(wallet);
  return groupFillsToTrades(fills);
}
