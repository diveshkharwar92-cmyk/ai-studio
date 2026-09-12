/**
 * Formatting helpers for the admin dashboard.
 *
 * All monetary values are displayed in Indian Rupees (₹) using the Indian
 * numbering system (lakhs / crores). Backend timestamps are nanosecond
 * bigints and must be converted through `timestampToDate` before any Date
 * operation.
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

const compactFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Convert a nanosecond backend timestamp to a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a monetary amount as Indian Rupees, e.g. ₹1,23,456. */
export function formatINR(value: bigint | number): string {
  return inrFormatter.format(Number(value));
}

/** Format a count with Indian grouping, e.g. 1,23,456. */
export function formatNumber(value: bigint | number): string {
  return numberFormatter.format(Number(value));
}

/** Format a count compactly, e.g. 1.2L / 3.4Cr. */
export function formatCompact(value: bigint | number): string {
  return compactFormatter.format(Number(value));
}

/** Format a nanosecond timestamp as a short date, e.g. 12 Sep 2026. */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format a nanosecond timestamp as date + time, e.g. 12 Sep 2026, 4:30 PM. */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format an optional ratio as a percentage, e.g. 42.5%. */
export function formatPercent(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}
