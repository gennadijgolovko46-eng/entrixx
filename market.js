/* ===============================
   ENTRIXX — MARKET CALC (V1)
   =============================== */

/*
Input:
- trades: [{ ts, side, exit_price }]
- ohlc:   [{ ts, open, high, low, close }]

All timestamps are milliseconds UTC.
*/

const MARKET_WINDOW_MS = 8 * 60 * 60 * 1000;

/* ---------- CORE ---------- */

export function computeMarket(trades, ohlc) {
  let mIndex = 0;

  return trades.map(trade => {
    const start = trade.ts;
    const end   = start + MARKET_WINDOW_MS;

    let maxHigh = -Infinity;
    let minLow  = Infinity;

    // advance market pointer
    while (mIndex < ohlc.length && ohlc[mIndex].ts < start) {
      mIndex++;
    }

    let i = mIndex;

    while (i < ohlc.length && ohlc[i].ts <= end) {
      const c = ohlc[i];
      if (c.high > maxHigh) maxHigh = c.high;
      if (c.low  < minLow)  minLow  = c.low;
      i++;
    }

    let market = 0;

    if (trade.side === "long") {
      market = maxHigh - trade.exit_price;
    } else {
      market = trade.exit_price - minLow;
    }

    return {
      ...trade,
      market: isFinite(market) ? market : 0
    };
  });
}
