// trades_from_hyperliquid.js
//
// Frontend contract:
// loadDataFromHyperliquid(account) -> { fills: [], trades: [...] }

const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

// seconds/ms normalization (same as index)
function toMs(v){
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return (n > 0 && n < 1e12) ? n * 1000 : n;
}

// ===== SAFE WINDOW (chunked backfill) =====
const DAY_MS = 24 * 60 * 60 * 1000;

// one request = 60 days (light load)
const CHUNK_DAYS = 60;
const WINDOW_MS  = CHUNK_DAYS * DAY_MS;

// backfill to correctly open/close trades near window edges
const LEAD_MS = 7 * DAY_MS;

// per-request limits
const MAX_FILLS  = 8000;
const MAX_TRADES = 5000;

// desired history depth (~11 months)
const TARGET_DAYS = 330;
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

// stable deduplication key for merging windows
function tradeKey(t){
  const et = Math.floor(toMs(t.entry_time));
  const xt = Math.floor(toMs(t.exit_time));
  const c  = String(t.coin ?? "");
  const d  = Number(t.dir) || 0;
  const ep = Number(t.entry_price) || 0;
  const xp = Number(t.exit_price) || 0;
  return `${c}|${d}|${et}|${xt}|${ep}|${xp}`;
}

// canonical stable sort
function canonSortTrades(arr){
  arr.sort((a,b)=>{
    const ax = toMs(a.exit_time), bx = toMs(b.exit_time);
    if(ax !== bx) return ax - bx;

    const ae = toMs(a.entry_time), be = toMs(b.entry_time);
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
  const out = [];
  const seen = new Set();

  for(let i = 0; i < MAX_CHUNKS; i++){
    const chunk = await fetchTradesChunk(acc, anchor);
    if(!chunk.length) break;

    // merge with deduplication
    for(const t of chunk){
      const k = tradeKey(t);
      if(seen.has(k)) continue;
      seen.add(k);
      out.push(t);
    }

    // move anchor backward using earliest entry_time in this chunk
    let minEntry = Infinity;
    for(const t of chunk){
      const e = toMs(t.entry_time);
      if(Number.isFinite(e)) minEntry = Math.min(minEntry, e);
    }

    if(!Number.isFinite(minEntry) || minEntry === Infinity) break;
    anchor = minEntry - 1;

    // stop if target history depth reached
    const oldest = Math.min(...out.map(t => toMs(t.entry_time)).filter(Number.isFinite));
    if(Number.isFinite(oldest) && (Date.now() - oldest) >= TARGET_DAYS * DAY_MS) break;
  }

  canonSortTrades(out);
  return { fills: [], trades: out };
}
