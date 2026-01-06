// time.js — ось времени (UTC, один день)

export function createTimeMapper(dayUTC, width, padding = 0) {
  const dayStart = new Date(dayUTC + "T00:00:00Z").getTime();
  const dayEnd   = new Date(dayUTC + "T23:59:59Z").getTime();

  const span = dayEnd - dayStart;

  function timeToX(ts) {
    return padding + ((ts - dayStart) / span) * (width - padding * 2);
  }

  function xToTime(x) {
    return dayStart + ((x - padding) / (width - padding * 2)) * span;
  }

  return { timeToX, xToTime, dayStart, dayEnd };
}
