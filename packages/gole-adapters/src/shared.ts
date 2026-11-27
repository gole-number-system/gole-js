import {
  GOLE_FONT_FAMILY,
  createGoleNumberFormat,
  formatDecimal,
  fromGolePUA,
  goleHTML,
  goleSegments,
  parseDecimal,
  type DecimalParts,
  type GoleNumberFormatOptions,
  type GoleOptions,
  type GoleSegment,
  type GoleValue,
} from "@gole-number-system/gole-core";

/** Options shared by every adapter. */
export interface GoleAdapterOptions extends GoleOptions {
  /**
   * Locale-aware formatting for currency, percent, units and compact numbers, as in
   * core's `createGoleNumberFormat`: `{ locale: "en-IN", style: "currency", currency: "INR" }`.
   * When set, `decimals` is ignored; use `minimumFractionDigits` / `maximumFractionDigits`.
   */
  format?: GoleNumberFormatOptions;
}

/** Options for adapters that draw text on a canvas, where one label has one font. */
export interface GoleCanvasOptions extends GoleAdapterOptions {
  /** Font(s) for everything that is not a Gole digit: signs, separators, letters. Default `"sans-serif"`. */
  fallbackFont?: string;
}

/** Everything a renderer needs to show one value. */
export interface GoleRendering {
  /** Gole text: padded digits (Ligature build) or PUA characters. */
  text: string;
  /** The ordinary decimal text, for `aria-label`, export and filters. */
  label: string;
  /** Gole numbers and the plain text around them. */
  segments: GoleSegment[];
  /** Escaped HTML: digits in `<span class="gole">`, numbers labelled with `role="img"`. */
  html: string;
}

/** A formatter with fixed options, see `createGoleAdapterFormat`. */
export interface GoleAdapterFormat {
  /** `true` when the value is one finite number (not mixed text, not empty). */
  isNumber(value: unknown): boolean;
  text(value: unknown): string;
  label(value: unknown): string;
  segments(value: unknown): GoleSegment[];
  html(value: unknown): string;
  render(value: unknown): GoleRendering;
}

/**
 * A font stack for canvas text: Gole digits first, then the fallback for every
 * character the Gole font does not have.
 *
 * ```ts
 * goleFontStack()                    // '"GoleStandard", sans-serif'
 * goleFontStack("Inter, sans-serif") // '"GoleStandard", Inter, sans-serif'
 * ```
 */
export function goleFontStack(fallback = "sans-serif"): string {
  return `"${GOLE_FONT_FAMILY}", ${fallback}`;
}

const toValue = (value: unknown): GoleValue =>
  typeof value === "number" || typeof value === "bigint" || typeof value === "string"
    ? value
    : value == null
      ? ""
      : String(value);

/** One finite number as plain parts, or `null`. Gole PUA text is read back to digits first. */
function parse(value: unknown): DecimalParts | null {
  if (typeof value === "number" || typeof value === "bigint") return parseDecimal(value);
  return typeof value === "string" ? parseDecimal(fromGolePUA(value)) : null;
}

/**
 * One formatter for all adapters: plain Gole padding by default, or locale-aware
 * formatting when `format` is set. Text that is not a single number (`"Q3 2026"`,
 * `"12:05"`) is always converted as mixed text, so it never turns into `NaN`.
 *
 * ```ts
 * const f = createGoleAdapterFormat({ decimals: 2 });
 * f.text(12747.2)    // "012747.20"
 * f.label(12747.2)   // "12747.20"
 * ```
 */
export function createGoleAdapterFormat(options: GoleAdapterOptions = {}): GoleAdapterFormat {
  const { format, ...gole } = options;
  const intl = format && createGoleNumberFormat({ build: gole.build, minPairs: gole.minPairs, ...format });
  const join = (segments: GoleSegment[], key: "text" | "value") =>
    segments.map((segment) => (segment.type === "number" ? segment[key] : segment.text)).join("");

  // With `format`, a number goes through Intl as a plain decimal string so long values stay exact.
  const intlValue = (value: unknown): string | null => {
    const parts = intl ? parse(value) : null;
    return parts && formatDecimal({ ...parts, sign: parts.sign === "−" ? "-" : parts.sign, integer: parts.integer || "0" });
  };

  const segments = (value: unknown): GoleSegment[] => {
    const number = intlValue(value);
    return number !== null ? intl!.segments(number) : goleSegments(toValue(value), gole);
  };
  const label = (value: unknown): string => {
    const number = intlValue(value);
    return number !== null ? intl!.label(number) : join(goleSegments(toValue(value), gole), "value");
  };
  const html = (value: unknown): string => {
    const number = intlValue(value);
    return number !== null ? intl!.html(number) : goleHTML(toValue(value), gole);
  };
  const text = (value: unknown) => join(segments(value), "text");

  return {
    isNumber: (value) => parse(value) !== null,
    text,
    label,
    segments,
    html,
    render: (value) => ({ text: text(value), label: label(value), segments: segments(value), html: html(value) }),
  };
}

/**
 * Remove binary floating point noise from a computed tick: `0.30000000000000004` → `0.3`.
 * Whole numbers and other types pass through.
 */
export function tidyNumber<T>(value: T): T | number {
  return typeof value === "number" && Number.isFinite(value) && !Number.isInteger(value)
    ? Number(value.toPrecision(15))
    : value;
}

const isEmpty = (value: unknown) => value == null || value === "";

/** -1, 0 or 1 for two non-negative digit strings, without converting them to numbers. */
function compareDigits(a: DecimalParts, b: DecimalParts): number {
  const wholeA = a.integer.replace(/^0+/, "");
  const wholeB = b.integer.replace(/^0+/, "");
  if (wholeA.length !== wholeB.length) return wholeA.length < wholeB.length ? -1 : 1;
  if (wholeA !== wholeB) return wholeA < wholeB ? -1 : 1;
  const fractionA = (a.fraction ?? "").replace(/0+$/, "");
  const fractionB = (b.fraction ?? "").replace(/0+$/, "");
  return fractionA === fractionB ? 0 : fractionA < fractionB ? -1 : 1;
}

const isZero = (parts: DecimalParts) => !/[1-9]/.test(parts.integer + (parts.fraction ?? ""));

/**
 * Compare two cell values as numbers, exactly: numbers, bigints, numeric strings of
 * any length (`"1863486135148634156"`), numbers with thousands separators and Gole
 * text in either build (`"0123"`, PUA characters) all sort by their decimal value.
 *
 * Empty values (`null`, `undefined`, `""`) come first, then numbers, then any other
 * text in code unit order.
 *
 * ```ts
 * ["100", 9n, "0012.5", null].sort(compareGole)   // [null, 9n, "0012.5", "100"]
 * ```
 */
export function compareGole(a: unknown, b: unknown): number {
  const emptyA = isEmpty(a);
  const emptyB = isEmpty(b);
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? -1 : 1;

  const partsA = parse(a);
  const partsB = parse(b);
  if (!partsA || !partsB) {
    if (partsA) return -1;
    if (partsB) return 1;
    const textA = String(a);
    const textB = String(b);
    return textA === textB ? 0 : textA < textB ? -1 : 1;
  }

  const negativeA = (partsA.sign === "-" || partsA.sign === "−") && !isZero(partsA);
  const negativeB = (partsB.sign === "-" || partsB.sign === "−") && !isZero(partsB);
  if (negativeA !== negativeB) return negativeA ? -1 : 1;
  return negativeA ? compareDigits(partsB, partsA) : compareDigits(partsA, partsB);
}

/** The plain decimal text of a value, without padding: `"0123"` → `"123"`, PUA text → digits. */
export function plainDecimal(value: unknown): string {
  const parts = parse(value);
  if (!parts) return typeof value === "string" ? fromGolePUA(value) : value == null ? "" : String(value);
  const integer = parts.integer.replace(/^0+(?=\d)/, "") || "0";
  return formatDecimal({ sign: parts.sign === "−" ? "-" : parts.sign === "+" ? "" : parts.sign, integer, fraction: parts.fraction });
}
