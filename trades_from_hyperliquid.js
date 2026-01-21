const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

async function getFills(account, limit = 1000) {
  const r = await fetch(`${API}/fills?account=${account}&limit=${limit}`);
  if (!r.ok) throw new Error("fills fetch failed");
  const j = await r.json();
  return j.fills || [];
}

function num(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : NaN;
}

function groupFillsToTrades(fills) {
  const trades = [];

  // per-coin position state
  // pos: signed size, avg: avg entry price, entry_time: when position opened
  const st = new Map();

  const fs = [...fills].sort((a,b) => num(a.time) - num(b.time));

  for (const f of fs) {
    const coin = String(f.coin || "");
    if (!coin) continue;

    const side = String(f.side || "");
    const px = num(f.px);
    const sz = num(f.sz);
    const t = num(f.time);

    if (!Number.isFinite(px) || !Number.isFinite(sz) || !Number.isFinite(t)) continue;
    if (sz <= 0) continue;

    const delta = (side === "B") ? sz : -sz;

    if (!st.has(coin)) {
      st.set(coin, { pos: 0, avg: NaN, entry_time: NaN, dir: 0 });
    }

    const s = st.get(coin);

    // opening new position
    if (s.pos === 0) {
      s.pos = delta;
      s.avg = px;
      s.entry_time = t;
      s.dir = (s.pos > 0) ? 1 : -1;
      continue;
    }

    // same direction add
    if ((s.pos > 0 && delta > 0) || (s.pos < 0 && delta < 0)) {
      const oldAbs = Math.abs(s.pos);
      const addAbs = Math.abs(delta);
      const newAbs = oldAbs + addAbs;
      s.avg = (s.avg * oldAbs + px * addAbs) / newAbs;
      s.pos = s.pos + delta;
      s.dir = (s.pos > 0) ? 1 : -1;
      continue;
    }

    // opposite direction: reduce/close/flip
    const oldPos = s.pos;
    const newPos = s.pos + delta;

    // fully close (or cross through zero)
    if (oldPos !== 0 && ((oldPos > 0 && newPos <= 0) || (oldPos < 0 && newPos >= 0))) {
      trades.push({
        coin,
        entry_time: s.entry_time,
        exit_time: t,
        entry_price: s.avg,
        exit_price: px,
        dir: (oldPos > 0) ? 1 : -1
      });

      // if flip, open new position with remaining size at same fill price/time
      if (newPos !== 0) {
        s.pos = newPos;
        s.avg = px;
        s.entry_time = t;
        s.dir = (s.pos > 0) ? 1 : -1;
      } else {
        s.pos = 0;
        s.avg = NaN;
        s.entry_time = NaN;
        s.dir = 0;
      }
      continue;
    }

    // partial reduce, still same sign
    s.pos = newPos;
    // avg stays
  }

  // do not create trades for still-open positions (no exit)
  return trades;
}

async function tryAttachMarketExtremes(trades) {
  // optional: if worker supports /market_window, attach mkt_up/mkt_dn for 8h after exit
  // if endpoint missing or fails, trades remain without green tails
  const out = [];
  for (const t of trades) {
    let mkt_up = NaN;
    let mkt_dn = NaN;

    try {
      const coin = encodeURIComponent(t.coin);
      const exitTime = Number(t.exit_time);
      const r = await fetch(`${API}/market_window?coin=${coin}&t=${exitTime}`);
      if (r.ok) {
        const j = await r.json();
        const hi = num(j.hi);
        const lo = num(j.lo);
        if (Number.isFinite(hi)) mkt_up = hi;
        if (Number.isFinite(lo)) mkt_dn = lo;
      }
    } catch (_) {}

    out.push({
      ...t,
      mkt_up,
      mkt_dn
    });
  }
  return out;
}

export async function loadDataFromHyperliquid(account) {
  const fills = await getFills(account, 1000);
  let trades = groupFillsToTrades(fills);
  trades = await tryAttachMarketExtremes(trades);
  return { fills, trades };
  }
