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

/* ===== LOAD FULL HISTORY (with pagination) ===== */
async function getFills(account) {
  let all = [];
  let end = Date.now();

  for (let i = 0; i < 12; i++) {   // 12 pages ~ several thousand fills
    const page = await post({
      type: "userFills",
      user: account,
      startTime: end
    });

    if (!page || page.length === 0) break;

    all = all.concat(page);
    end = page[page.length - 1].time;
  }

  return all;
}

/* ===== FILLS → TRADES ===== */
function groupFills(fills) {
  const trades = [];
  const open = {};

  fills.sort((a,b)=>a.time-b.time);

  for (const f of fills) {
    const sym  = f.coin;
    const side = f.side;      // "B" or "S"
    const px   = Number(f.px);
    const t    = f.time;

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

/* ===== PUBLIC API ===== */
export async function loadTradesFromHyperliquid(account) {
  const fills = await getFills(account);
  return groupFills(fills);
}
