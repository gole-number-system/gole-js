/** A value that can be written in Gole. */
export type GoleValue = number | bigint | string;

/** A plain decimal number split into its parts. No exponent, no grouping. */
export interface DecimalParts {
  /** `""`, `"-"`, `"+"` or `"−"` (U+2212), exactly as given. */
  sign: string;
  /** Digits before the decimal point. May be empty (`".5"`). Leading zeros are kept. */
  integer: string;
  /** Digits after the decimal point, or `null` when there is no decimal point. */
  fraction: string | null;
}

const NUMERIC = /^([+\-−]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/;
// A number written with thousands separators: 1,234,567 · 12,34,567 · 1_000 · 1 234.5
const GROUPED = /^[+\-−]?\d{1,3}(?:[,_'’\s]\d{2,3})+(?:\.\d*)?$/;
const GROUPING = /[,_'’\s]/g;

/** Move the decimal point of `integer.fraction` by `exponent` places. */
function shift(integer: string, fraction: string, exponent: number): [string, string] {
  if (exponent > 0) {
    const moved = fraction.padEnd(exponent, "0");
    return [integer + moved.slice(0, exponent), moved.slice(exponent)];
  }
  const moved = integer.padStart(-exponent, "0");
  return [moved.slice(0, moved.length + exponent), moved.slice(moved.length + exponent) + fraction];
}

/**
 * Split one decimal number into sign, integer digits and fraction digits.
 *
 * Accepts numbers, bigints and numeric strings. Thousands separators (`,` `_` `'`
 * or a space between groups of two or three digits) are removed and exponents are
 * expanded, so `"1,00,000"` → `100000` and `1e21` → `1000000000000000000000`.
 *
 * Returns `null` when the value is not a single finite number (`NaN`, `"12:05"`, `"abc"`).
 */
export function parseDecimal(value: GoleValue): DecimalParts | null {
  if (typeof value === "number" && !Number.isFinite(value)) return null;
  const text = String(value).trim();
  const match = NUMERIC.exec(GROUPED.test(text) ? text.replace(GROUPING, "") : text);
  if (!match) return null;

  const sign = match[1] ?? "";
  let integer = match[2] ?? "";
  let fraction: string | null = match[3] ?? null;
  if (integer === "" && !fraction) return null; // "", ".", "-", "e5"

  const exponent = match[4] ? Number(match[4]) : 0;
  if (exponent !== 0) {
    if (Math.abs(exponent) > 10_000) return null;
    [integer, fraction] = shift(integer, fraction ?? "", exponent);
    integer = integer.replace(/^0+(?=\d)/, "");
    if (fraction === "") fraction = null;
  }
  return { sign, integer, fraction };
}

/** Add one to a string of digits: `"199"` → `"200"`, `"99"` → `"100"`. */
function increment(digits: string): string {
  const out = digits.split("");
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] !== "9") {
      out[i] = String(Number(out[i]) + 1);
      return out.join("");
    }
    out[i] = "0";
  }
  return "1" + out.join("");
}

/**
 * Round to a fixed number of fraction digits, working on the digits themselves
 * so long values keep every digit. Ties round away from zero: `1.005` → `1.01`.
 */
export function roundDecimal(parts: DecimalParts, decimals: number): DecimalParts {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError(`decimals must be a non-negative integer, got ${decimals}`);
  }
  const fraction = parts.fraction ?? "";
  let integer = parts.integer || "0";
  let kept = fraction.slice(0, decimals).padEnd(decimals, "0");

  if (fraction.length > decimals && fraction.charCodeAt(decimals) >= 53 /* "5" */) {
    const width = integer.length;
    const bumped = increment(integer + kept);
    integer = bumped.slice(0, bumped.length - decimals).padStart(width, "0");
    kept = decimals ? bumped.slice(-decimals) : "";
  }
  return { sign: parts.sign, integer, fraction: decimals ? kept : null };
}

/** Join the parts back into a plain decimal string. */
export function formatDecimal({ sign, integer, fraction }: DecimalParts): string {
  return sign + integer + (fraction === null ? "" : "." + fraction);
}
