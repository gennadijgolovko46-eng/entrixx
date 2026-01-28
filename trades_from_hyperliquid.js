// trades_from_hyperliquid.js
//
// Frontend contract:
// loadDataFromHyperliquid(account) -> { fills: [], trades: [...], truncated: boolean, meta?: {...} }
//
// FULLY COMPATIBLE with current worker:
// - /trades supports only: account (required), t (optional), maxTrades (optional)
// - Worker enforces HARD 90d window internally (by exit_time)
// - Dedup key uses only fields that worker actually returns.
//
// NEW:
// - Adds `truncated` flag when response hit the limit (latest N only).
// - Adds optional `meta` with counts/limits (safe to ignore by UI).

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

// seconds/ms normalization (safe if worker ever returns seconds)
function toMs(v){
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return (n > 0 && n < 1e12) ? n * 1000 : n;
}

function numOrInf(x, inf = Infinity){
  return Number.isFinite(x) ? x : inf;
}

function numOr0(x){
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

// per-request limit (must match worker clamps; worker default=5000)
const MAX_TRADES = 5000;

// client-side timeout
const FETCH_TIMEOUT_MS = 12000;

async function fetchTradesWithMeta(acc, anchorMs){
  // Worker contract:
  // GET /trades?account=...&t=...&maxTrades=...
  // NOTE: worker accepts seconds or ms; we send ms.
  const url =
    `${API}/trades` +
    `?account=${encodeURIComponent(acc)}` +
    `&t=${Math.floor(anchorMs)}` +
    `&maxTrades=${MAX_TRADES}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let r;
  try{
    r = await fetch(url, { method: "GET", signal: controller.signal });
  }catch(e){
    throw new Error(
      e?.name === "AbortError"
        ? `Timeout ${FETCH_TIMEOUT_MS}ms`
        : "Network error"
    );
  }finally{
    clearTimeout(timer);
  }

  if(!r.ok){
    const text = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} while fetching trades\n${text.slice(0,200)}`);
  }

  const j = await r.json().catch(() => null);

  const trades = Array.isArray(j?.trades) ? j.trades : [];

  // "hard" signal from worker if present
  const tradesCount = Number(j?.tradesCount);
  const safetyMax = Number(j?.safety?.maxTrades);

  // truncated if we likely hit the cap (latest N only)
  // Prefer worker numbers; otherwise fall back to local MAX_TRADES heuristic.
  const truncated =
    (Number.isFinite(tradesCount) && Number.isFinite(safetyMax))
      ? (tradesCount >= safetyMax && safetyMax > 0)
      : (trades.length >= MAX_TRADES);

  const meta = {
    tradesCount: Number.isFinite(tradesCount) ? tradesCount : trades.length,
    maxTrades: Number.isFinite(safetyMax) ? safetyMax : MAX_TRADES,
    windowDays: Number(j?.windowDays) || 90,
    dbIsSeconds: !!j?.safety?.dbIsSeconds,
    startDb: j?.safety?.startDb ?? null,
    anchorDb: j?.safety?.anchorDb ?? null,
    scope: String(j?.scope || "coin"),
  };

  return { trades, truncated, meta };
}

// Dedup key: uses only fields returned by current worker:
// coin, dir, entry_time, exit_time, entry_price, exit_price
function tradeKey(t){
  const etMs = toMs(t?.entry_time);
  const xtMs = toMs(t?.exit_time);

  const et = Number.isFinite(etMs) ? Math.floor(etMs) : 0;
  const xt = Number.isFinite(xtMs) ? Math.floor(xtMs) : 0;

  const c  = String(t?.coin ?? "");
  const d  = Number(t?.dir) || 0;

  const ep = numOr0(t?.entry_price);
  const xp = numOr0(t?.exit_price);

  // fixed precision to stabilize floating noise without overfitting
  const epKey = ep ? ep.toFixed(12) : "0";
  const xpKey = xp ? xp.toFixed(12) : "0";

  return `w:${c}|${d}|${et}|${xt}|${epKey}|${xpKey}`;
}

// canonical stable sort (NaN-safe via numOrInf)
function canonSortTrades(arr){
  arr.sort((a,b)=>{
    const ax = numOrInf(toMs(a?.exit_time));
    const bx = numOrInf(toMs(b?.exit_time));
    if(ax !== bx) return ax - bx;

    const ae = numOrInf(toMs(a?.entry_time));
    const be = numOrInf(toMs(b?.entry_time));
    if(ae !== be) return ae - be;

    const ac = String(a?.coin ?? "");
    const bc = String(b?.coin ?? "");
    if(ac !== bc) return ac < bc ? -1 : 1;

    const ad = Number(a?.dir) || 0;
    const bd = Number(b?.dir) || 0;
    if(ad !== bd) return ad - bd;

    const aep = Number(a?.entry_price) || 0;
    const bep = Number(b?.entry_price) || 0;
    if(aep !== bep) return aep - bep;

    const axp = Number(a?.exit_price) || 0;
    const bxp = Number(b?.exit_price) || 0;
    if(axp !== bxp) return axp - bxp;

    return 0;
  });
}

export async function loadDataFromHyperliquid(account){
  const acc = String(account || "").trim();
  if(!acc) return { fills: [], trades: [], truncated: false, meta: { tradesCount: 0, maxTrades: MAX_TRADES } };

  // One request is enough: worker already returns HARD 90d window internally.
  const anchor = Date.now();

  const { trades, truncated, meta } = await fetchTradesWithMeta(acc, anchor);

  // Dedup defensively (even though worker should already be unique by PK)
  const out = [];
  const seen = new Set();
  for(const t of trades){
    const k = tradeKey(t);
    if(seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }

  canonSortTrades(out);

  // Note: if you want, you can also consider:
  // const truncated2 = truncated || (out.length >= (meta?.maxTrades || MAX_TRADES));
  // but current is enough.

  return { fills: [], trades: out, truncated, meta };
}
