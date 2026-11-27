import { GOLE_PUA_BASE, type GoleBuild } from "./constants";
import { formatDecimal, parseDecimal, roundDecimal, type GoleValue } from "./decimal";

export interface GoleOptions {
  /** Font build the output is for. Default `"ligature"`. */
  build?: GoleBuild;
  /**
   * Fixed number of fraction digits, rounded half away from zero.
   * Only applies when the value is a single number, not mixed text.
   */
  decimals?: number;
  /** Minimum number of Gole symbols in the whole part: `minPairs: 2` writes 7 as `[00][07]`. */
  minPairs?: number;
  /**
   * Character that starts the fraction in mixed text. Default `"."`.
   * Pass `false` to treat every run of digits as a whole number,
   * for example in dotted dates such as `1.5.2026`.
   */
  decimalSeparator?: string | false;
  /**
   * Thousands separator to remove from numbers in mixed text, for example `","`.
   * Default `false`: separators are left alone and each group is padded on its own.
   */
  grouping?: string | false;
}

/** A piece of converted text: either one Gole number or the plain text between numbers. */
export type GoleSegment = GoleTextSegment | GoleNumberSegment;

export interface GoleTextSegment {
  type: "text";
  text: string;
}

export interface GoleNumberSegment {
  type: "number";
  /** Text to display: `integer + separator + fraction`. */
  text: string;
  /** The decimal number this segment stands for, as it was written: `"12.5"`. */
  value: string;
  /** Whole part in the chosen build: padded digits or PUA characters. Set this in the Gole font. */
  integer: string;
  /** Decimal separator, or `""` when there is no fraction. Not a Gole glyph. */
  separator: string;
  /** Fraction part in the chosen build. Set this in the Gole font. */
  fraction: string;
  /** The decimal digit pairs behind the symbols: `["12", "50"]`. */
  pairs: string[];
  /** How many of `pairs` belong to the whole part. */
  integerPairs: number;
  /** Zeros added in front of the whole part: 1 for `123`, 0 for `35`, more with `minPairs`. */
  padLeft: number;
  /** Zeros added after the fraction: 1 for `12.5`, otherwise 0. */
  padRight: number;
}

/** Pad a whole part on the left to whole pairs: `"123"` → `"0123"`, `""` → `"00"`. */
export function padInteger(digits: string, minPairs = 1): string {
  const even = digits.length % 2 ? "0" + digits : digits;
  return even.padStart(Math.max(minPairs, 1) * 2, "0");
}

/** Pad a fraction part on the right to whole pairs: `"5"` → `"50"`. */
export function padFraction(digits: string): string {
  return digits.length % 2 ? digits + "0" : digits;
}

/** Padded digits → one PUA character per pair: `"0123"` → `""`. */
export function pairsToPUA(paddedDigits: string): string {
  return paddedDigits.replace(/\d\d/g, (pair) => String.fromCharCode(GOLE_PUA_BASE + Number(pair)));
}

/** Build one number segment from digits that are already split. Not part of the public API. */
export function numberSegment(
  value: string,
  integerDigits: string,
  separator: string,
  fractionDigits: string | null,
  options: GoleOptions,
): GoleNumberSegment {
  const paddedInteger = padInteger(integerDigits, options.minPairs);
  const paddedFraction = fractionDigits === null ? "" : padFraction(fractionDigits);
  const encode = options.build === "pua" ? pairsToPUA : (digits: string) => digits;
  const integer = encode(paddedInteger);
  const fraction = encode(paddedFraction);
  const sep = fractionDigits === null ? "" : separator;
  const integerPairs = paddedInteger.match(/\d\d/g) ?? [];
  return {
    type: "number",
    text: integer + sep + fraction,
    value,
    integer,
    separator: sep,
    fraction,
    pairs: [...integerPairs, ...(paddedFraction.match(/\d\d/g) ?? [])],
    integerPairs: integerPairs.length,
    padLeft: paddedInteger.length - integerDigits.length,
    padRight: paddedFraction.length - (fractionDigits?.length ?? 0),
  };
}

const escapeRegExp = (text: string) => text.replace(/[-.*+?^${}()|[\]\\]/g, "\\$&");

/** Groups after the first must have two or three digits (covers 1,234,567 and 12,34,567). */
const isGrouped = (groups: string[]) =>
  groups[0]!.length <= 3 && groups.slice(1).every((group) => group.length === 2 || group.length === 3);

function textSegments(text: string, options: GoleOptions): GoleSegment[] {
  const decimal = options.decimalSeparator === undefined ? "." : options.decimalSeparator || "";
  const grouping = options.grouping || "";
  const joiners = [...new Set([...decimal, ...grouping])].map(escapeRegExp).join("");
  // A chain is runs of digits joined by single separator characters: "1,234.5", "192.168.1.1".
  const chain = new RegExp(joiners ? `\\d+(?:[${joiners}]\\d+)*` : "\\d+", "g");

  const segments: GoleSegment[] = [];
  const pushText = (piece: string) => {
    const last = segments[segments.length - 1];
    if (!piece) return;
    if (last?.type === "text") last.text += piece;
    else segments.push({ type: "text", text: piece });
  };

  let cursor = 0;
  for (const match of text.matchAll(chain)) {
    const source = match[0];
    pushText(text.slice(cursor, match.index));
    cursor = match.index + source.length;

    const groups = source.split(/\D/);
    const separators: string[] = source.match(/\D/g) ?? [];
    const lastSeparator = separators[separators.length - 1];
    const hasFraction =
      decimal !== "" && lastSeparator === decimal && separators.indexOf(decimal) === separators.length - 1;
    const integerGroups = hasFraction ? groups.slice(0, -1) : groups;
    const integerSeparators = hasFraction ? separators.slice(0, -1) : separators;
    const integerIsOneNumber =
      integerGroups.length === 1 ||
      (grouping !== "" && integerSeparators.every((s: string) => grouping.includes(s)) && isGrouped(integerGroups));

    if (integerIsOneNumber) {
      const fraction = hasFraction ? groups[groups.length - 1]! : null;
      segments.push(numberSegment(source, integerGroups.join(""), decimal, fraction, options));
    } else {
      // Not one number (a dotted date, an IP address, a version): pad every run on its own.
      groups.forEach((group, i) => {
        segments.push(numberSegment(group, group, "", null, options));
        pushText(separators[i] ?? "");
      });
    }
  }
  pushText(text.slice(cursor));
  return segments;
}

/**
 * Convert a value into segments: Gole numbers and the plain text around them.
 * This is the function the others are built on; use it when the digits and the
 * surrounding text need different fonts or markup.
 *
 * A single number (`123`, `"-4.5"`, `12n`, `"1,00,000"`) becomes one number segment,
 * with its sign as a text segment in front. Anything else is treated as mixed text
 * and every run of digits in it is padded separately.
 */
export function goleSegments(value: GoleValue, options: GoleOptions = {}): GoleSegment[] {
  const parsed = parseDecimal(value);
  if (!parsed) return textSegments(String(value), options);

  const parts = options.decimals === undefined ? parsed : roundDecimal(parsed, options.decimals);
  const unsigned = formatDecimal({ ...parts, sign: "", integer: parts.integer || "0" });
  const number = numberSegment(unsigned, parts.integer, ".", parts.fraction || null, options);
  const segments: GoleSegment[] = parts.sign ? [{ type: "text", text: parts.sign }, number] : [number];
  if (typeof value !== "string") return segments;
  // Keep the spaces around a number in a string, so " 7 " between two elements stays apart from them.
  const before = /^\s*/.exec(value)![0];
  const after = /\s*$/.exec(value)![0];
  if (before) segments.unshift({ type: "text", text: before });
  if (after) segments.push({ type: "text", text: after });
  return segments;
}

/**
 * Write a value in Gole.
 *
 * The whole part is padded with a `0` on the left and the fraction with a `0` on the
 * right, so every part has whole pairs of digits. With the Ligature build (default)
 * the padded digits are the result; with `build: "pua"` each pair becomes one
 * Private Use Area character.
 *
 * ```ts
 * toGole(123)                       // "0123"        shows [01][23]
 * toGole(12.5)                      // "12.50"       shows [12].[50]
 * toGole(-4.5)                      // "-04.50"
 * toGole(7, { build: "pua" })       // ""
 * toGole("20/11/2026")              // "20/11/2026"  shows [20]/[11]/[20][26]
 * toGole("Bill 505-2347")           // "Bill 0505-2347"
 * ```
 */
export function toGole(value: GoleValue, options: GoleOptions = {}): string {
  return goleSegments(value, options)
    .map((segment) => segment.text)
    .join("");
}

/** Same as `toGole(value, { ...options, build: "pua" })`. */
export function toGolePUA(value: GoleValue, options: Omit<GoleOptions, "build"> = {}): string {
  return toGole(value, { ...options, build: "pua" });
}

/**
 * The plain decimal text a Gole rendering stands for, for `aria-label`, `title`
 * or a data attribute: `goleLabel(12747.2, { decimals: 2 })` → `"12747.20"`.
 */
export function goleLabel(value: GoleValue, options: GoleOptions = {}): string {
  return goleSegments(value, options)
    .map((segment) => (segment.type === "number" ? segment.value : segment.text))
    .join("");
}

/** The digit pairs of a value, in order: `golePairs(123)` → `["01", "23"]`. */
export function golePairs(value: GoleValue, options: GoleOptions = {}): string[] {
  return goleSegments(value, options).flatMap((segment) => (segment.type === "number" ? segment.pairs : []));
}

/** How many Gole symbols a value takes: `goleCount(1863486135148634156n)` → `10`. */
export function goleCount(value: GoleValue, options: GoleOptions = {}): number {
  return golePairs(value, options).length;
}

/**
 * PUA text → padded decimal digits: `""` → `"0123"`.
 * Characters that are not Gole symbols pass through unchanged.
 */
export function fromGolePUA(text: string): string {
  let out = "";
  for (const char of text) {
    const n = char.charCodeAt(0) - GOLE_PUA_BASE;
    out += char.length === 1 && n >= 0 && n < 100 ? String(n).padStart(2, "0") : char;
  }
  return out;
}

/**
 * Read one Gole number back as a JavaScript number. Works for both builds:
 * `fromGole("0123")` → `123`, `fromGole(".")` → `12.5`.
 * Returns `NaN` when the text is not a single number.
 */
export function fromGole(text: string): number {
  const parts = parseDecimal(fromGolePUA(text));
  return parts ? Number(formatDecimal(parts).replace("−", "-")) : NaN;
}

/** The single Gole symbol for a value from 0 to 99. */
export function goleSymbol(n: number, build: GoleBuild = "ligature"): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) {
    throw new RangeError(`A Gole symbol stands for an integer from 0 to 99, got ${n}`);
  }
  return build === "pua" ? String.fromCharCode(GOLE_PUA_BASE + n) : String(n).padStart(2, "0");
}

/** A reusable formatter with fixed options, handy for chart ticks and table columns. */
export function createGoleFormatter(options: GoleOptions = {}): (value: GoleValue) => string {
  return (value) => toGole(value, options);
}
