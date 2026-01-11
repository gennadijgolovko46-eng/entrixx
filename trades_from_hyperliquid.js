// trades_from_hyperliquid.js
const HL = "https://api.hyperliquid.xyz/info";
const DAY_MS = 86400000;

async function post(body) {
  const r = await fetch(HL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return r.json();
}

// 1) wallet → trading account
async function getAccount(wallet) {
  const res = await post({
    type: "userState",
    user: wallet
  });
  return res.account; // this is 0x5b5d...c060
}

// 2) account → fills
async function getFills(account) {
  return post({
    type: "userFills",
    user: account
  });
}

// 3) fills → ENTRIXX trades
function groupFills(fills) {
  const trades = [];
  const open = {};

  fills.sort((a,b)=>a.time-b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side; // "B" or "S"
    const px = Number(f.px);
    const t = f.time;

    if (!open[sym]) {
      open[sym] = { side, t, px };
    } else {
      const o = open[sym];
      if (o.side !== side) {
        trades.push({
          entry_time: o.t,
          exit_time: t,
          entry_price: o.px,
          exit_price: px,
          dir: o.side === "B" ? 1 : -1
        });
        open[sym] = null;
      }
    }
  }
  return trades;
}

// PUBLIC API
export async function loadTradesFromHyperliquid(wallet) {
  const account = await getAccount(wallet);       // FIX
  const fills = await getFills(account);          // FIX
  return groupFills(fills);                       // REAL TRADES
}
