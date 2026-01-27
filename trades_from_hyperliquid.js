// trades_from_hyperliquid.js
//
// Frontend contract:
// loadDataFromHyperliquid(account) -> { fills: [], trades: [...] }

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

const DAY_MS = 24 * 60 * 60 * 1000;

// one request = 60 days (light load)
const CHUNK_DAYS = 60;
const WINDOW_MS  = CHUNK_DAYS * DAY_MS;

// backfill to correctly open/close trades near window edges
const LEAD_MS = 7 * DAY_MS;

// per-request limits (must match worker clamps)
const MAX_FILLS  = 8000;
const MAX_TRADES = 5000;

// aligned with worker retention (90d)
const TARGET_DAYS = 90;
const MAX_CHUNKS  = Math.ceil(TARGET_DAYS / CHUNK_DAYS);

// client-side timeout
const FETCH_TIMEOUT_MS = 12000;

async function fetchTradesChunk(acc, anchorMs){
  const url =
    `${API}/trades` +
    `?account=${encodeURIComponent(acc)}` +
    `&scope=coin` +
    `&t=${Math.floor(anchorMs)}` +
    `&windowMs=${WINDOW_MS}` +
    `&leadMs=${LEAD_MS}` +
    `&maxFills=${MAX_FILLS}` +
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

  const j = await r.json();
  return Array.isArray(j?.trades) ? j.trades : [];
}

// Dedup key: prefer worker-provided stable id (zero-risk).
// Fallback stays stable if id is missing (older worker).
function tradeKey(t){
  const id = String(t?.id || "").trim();
  if (id) return `id:${id}`;

  const etMs = toMs(t.entry_time);
  const xtMs = toMs(t.exit_time);

  const et = Number.isFinite(etMs) ? Math.floor(etMs) : 0;
  const xt = Number.isFinite(xtMs) ? Math.floor(xtMs) : 0;

  const c  = String(t.coin ?? "");
  const d  = Number(t.dir) || 0;

  const s = numOr0(t.size ?? t.qty);
  const sKey = s ? s.toFixed(10) : "0";

  const ep = numOr0(t.entry_price);
  const xp = numOr0(t.exit_price);
  const epKey = ep ? ep.toFixed(12) : "0";
  const xpKey = xp ? xp.toFixed(12) : "0";

  return `fb:${c}|${d}|${et}|${xt}|${sKey}|${epKey}|${xpKey}`;
}

// canonical stable sort (NaN-safe via numOrInf)
function canonSortTrades(arr){
  arr.sort((a,b)=>{
    const ax = numOrInf(toMs(a.exit_time));
    const bx = numOrInf(toMs(b.exit_time));
    if(ax !== bx) return ax - bx;

    const ae = numOrInf(toMs(a.entry_time));
    const be = numOrInf(toMs(b.entry_time));
    if(ae !== be) return ae - be;

    const ac = String(a.coin ?? ""), bc = String(b.coin ?? "");
    if(ac !== bc) return ac < bc ? -1 : 1;

    const ad = Number(a.dir) || 0, bd = Number(b.dir) || 0;
    if(ad !== bd) return ad - bd;

    const aep = Number(a.entry_price) || 0, bep = Number(b.entry_price) || 0;
    if(aep !== bep) return aep - bep;

    const axp = Number(a.exit_price) || 0, bxp = Number(b.exit_price) || 0;
    if(axp !== bxp) return axp - bxp;

    return 0;
  });
}

export async function loadDataFromHyperliquid(account){
  const acc = String(account || "").trim();
  if(!acc) return { fills: [], trades: [] };

  // start from "now" to guarantee latest days
  let anchor = Date.now();
  let lastAnchor = anchor;

  const out = [];
  const seen = new Set();

  // incremental oldest tracking (avoids O(n^2))
  let oldestEntry = Infinity;

  for(let i = 0; i < MAX_CHUNKS; i++){
    const chunk = await fetchTradesChunk(acc, anchor);
    if(!chunk.length) break;

    for(const t of chunk){
      const k = tradeKey(t);
      if(seen.has(k)) continue;
      seen.add(k);
      out.push(t);

      const e = toMs(t.entry_time);
      if(Number.isFinite(e)) oldestEntry = Math.min(oldestEntry, e);
    }

    // IMPORTANT: move anchor by MIN exit_time (leadMs can push entry_time far earlier than the window)
    let minExit = Infinity;
    for(const t of chunk){
      const x = toMs(t.exit_time);
      if(Number.isFinite(x)) minExit = Math.min(minExit, x);
    }
    if(!Number.isFinite(minExit) || minExit === Infinity) break;

    const nextAnchor = minExit - 1;
    if(!(nextAnchor < lastAnchor)) break; // must move backward
    anchor = nextAnchor;
    lastAnchor = anchor;

    // stop by achieved history depth (by entry_time)
    if(Number.isFinite(oldestEntry) && (Date.now() - oldestEntry) >= TARGET_DAYS * DAY_MS) break;
  }

  canonSortTrades(out);
  return { fills: [], trades: out };
}
