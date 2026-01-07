/* ===============================
   ENTRIXX — HOLD CALC (V1)
   =============================== */

/*
Input:
- trades: [{ side, entry_price, exit_price }]
*/

export function computeHold(trades) {
  return trades.map(trade => {
    let hold = 0;

    if (trade.side === "long") {
      hold = trade.exit_price - trade.entry_price;
    } else {
      hold = trade.entry_price - trade.exit_price;
    }

    return {
      ...trade,
      hold
    };
  });
}
