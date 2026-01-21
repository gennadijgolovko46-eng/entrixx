const API = "https://twilight-breeze-fa50.gennadijgolovko46.workers.dev";

// сколько максимум строк тянуть (чтобы не убить память)
const MAX_FILLS = 20000;
// размер страницы на воркере (у тебя лимит <= 500)
const PAGE_LIMIT = 500;

async function fetchFillsPage(account, before) {
  const u = new URL(`${API}/fills`);
  u.searchParams.set("account", account);
  u.searchParams.set("limit", String(PAGE_LIMIT));
  if (before != null) u.searchParams.set("before", String(before));

  const r = await fetch(u.toString());
  if (!r.ok) throw new Error("fills fetch failed");
  return await r.json();
}

async function getFills(account) {
  const out = [];
  let before = Date.now();

  while (out.length < MAX_FILLS) {
    const j = await fetchFillsPage(account, before);
    const page = j.fills || [];
    if (!page.length) break;

    out.push(...page);

    // воркер уже возвращает next_before
    const nb = j.next_before;
    if (!nb) break;

    // следующий запрос берём строго раньше
    before = nb - 1;
  }

  return out;
}

function groupFills(fills) {
  const trades = [];
  const open = {};

  fills.sort((a, b) => a.time - b.time);

  for (const f of fills) {
    const sym = f.coin;
    const side = f.side; // "B" or "A"
    const px = Number(f.px);
    const t = f.time;

    if (!open[sym]) {
      open[sym] = { side, t, px };
      continue;
    }

    const o = open[sym];

    // закрытие при смене стороны
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

  return trades;
}

export async function loadDataFromHyperliquid(account) {
  const fills = await getFills(account);
  const trades = groupFills(fills);
  return { fills, trades };
}
