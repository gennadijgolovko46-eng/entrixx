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

/* wallet → L2 account */
async function getAccount(wallet) {
  const r = await post({ type: "userState", user: wallet });
  return r.account;
}

/* paged fills */
async function getAllFills(account) {
  let all = [];
  let cursor = null;

  while (true) {
    const r = await post({
      type: "userFills",
      user: account,
      limit: 500,
      after: cursor
    });

    if (!r || !r.length) break;

    all.push(...r);
    cursor = r[r.length - 1].time;

    if (r.length < 500) break;
  }

  return all;
}

/* fills → trades */
function groupFills(fills) {
  const trades = [];
  const open = {};

  fills.sort((a, b) => a.time - b.time);

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

export async function loadTradesFromHyperliquid(wallet) {
  const account = await getAccount(wallet);
  const fills = await getAllFills(account);
  return groupFills(fills);
}
