import type { GoleBuild } from "./constants";
import { goleSegments, type GoleSegment } from "./gole";

/** A `Date`, a timestamp in milliseconds or a date string. */
export type GoleDateInput = Date | number | string;

const two = (n: number) => String(n).padStart(2, "0");

/**
 * Fill a pattern from a date. Tokens: `YYYY` `YY` `MM` `DD` `HH` (00–23) `hh` (01–12)
 * `mm` `ss` `A` (AM/PM). Text inside `[...]` and everything else is copied as it is.
 */
export function formatDatePattern(date: Date, pattern: string, utc = false): string {
  const get = (part: "FullYear" | "Month" | "Date" | "Hours" | "Minutes" | "Seconds") =>
    utc ? date[`getUTC${part}`]() : date[`get${part}`]();
  const hours = get("Hours");
  const tokens: Record<string, string> = {
    YYYY: String(get("FullYear")).padStart(4, "0"),
    YY: two(get("FullYear") % 100),
    MM: two(get("Month") + 1),
    DD: two(get("Date")),
    HH: two(hours),
    hh: two(hours % 12 || 12),
    mm: two(get("Minutes")),
    ss: two(get("Seconds")),
    A: hours < 12 ? "AM" : "PM",
  };
  return pattern.replace(/\[([^\]]*)\]|YYYY|YY|MM|DD|HH|hh|mm|ss|A/g, (token, literal?: string) =>
    literal !== undefined ? literal : tokens[token]!,
  );
}

export interface GoleDateOptions {
  /**
   * A pattern of tokens (see `formatDatePattern`), or `Intl.DateTimeFormat` options
   * for locale-aware text such as `{ dateStyle: "medium" }`. Default `"DD/MM/YYYY"`.
   */
  format?: string | Intl.DateTimeFormatOptions;
  /** Locale for `Intl.DateTimeFormat` options. Default: the runtime's locale. */
  locale?: string | string[];
  /** Read the date in UTC instead of local time. */
  utc?: boolean;
  /** Font build the output is for. Default `"ligature"`. */
  build?: GoleBuild;
}

/** The ordinary text of a date, before conversion: `"20/11/2026"`. Returns `""` for an invalid date. */
export function goleDateLabel(value: GoleDateInput, options: GoleDateOptions = {}): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const { format = "DD/MM/YYYY", locale, utc } = options;
  if (typeof format === "string") return formatDatePattern(date, format, utc);
  return new Intl.DateTimeFormat(locale, {
    ...format,
    numberingSystem: "latn",
    ...(utc && { timeZone: "UTC" }),
  }).format(date);
}

/**
 * A date or time as segments. Every run of digits is a whole number of its own, so
 * day, month, hours and minutes are one symbol each and a four-digit year is two.
 */
export function goleDateSegments(value: GoleDateInput, options: GoleDateOptions = {}): GoleSegment[] {
  return goleSegments(goleDateLabel(value, options), { build: options.build, decimalSeparator: false });
}

/**
 * A date or time in Gole.
 *
 * ```ts
 * goleDate("2026-11-20")                                   // "20/11/2026"  shows [20]/[11]/[20][26]
 * goleDate(Date.now(), { format: "HH:mm" })                // "12:05"
 * goleDate(date, { format: { dateStyle: "medium" }, locale: "en-IN" })  // "20 Nov 2026"
 * ```
 */
export function goleDate(value: GoleDateInput, options: GoleDateOptions = {}): string {
  return goleDateSegments(value, options)
    .map((segment) => segment.text)
    .join("");
}
