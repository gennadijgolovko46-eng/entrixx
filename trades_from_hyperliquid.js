const HL = "https://api.hyperliquid.xyz/info";

async function post(body) {
  const r = await fetch(HL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error("HL request failed");
  return r.json();
}

// load ALL fills by paging backward in time
async function getAllFills(account) {
  let all = [];
  let startTime = Date.now();
  let keep = true;

  while (keep) {
    const batch = await post({
      type: "userFills",
      user: account,
      limit: 200,
      startTime
    });

    if (!batch || batch.length === 0) break;

    all.push(...batch);

    // go earlier than oldest fill
    startTime = Math.min(...batch.map(f => f.time)) - 1;

    // safety stop (in case API bugs)
    if (batch.length < 200) keep = false;
  }

  return all;
}

// fills → ENTRIXX trades
function groupFills(fills) {
  const trades = [];
  const open = {};

  fills.sort((a,b)=>a.time-b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side;
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

export async function loadTradesFromHyperliquid(account) {
  const fills = await getAllFills(account);
  return groupFills(fills);
}
