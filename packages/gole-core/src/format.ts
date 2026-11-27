import type { GoleBuild } from "./constants";
import type { GoleValue } from "./decimal";
import { numberSegment, type GoleSegment } from "./gole";
import { segmentsHTML, type GoleHTMLOptions } from "./html";

/**
 * Options for locale-aware formatting. Everything `Intl.NumberFormat` accepts
 * (`style`, `currency`, `unit`, `notation`, `minimumFractionDigits`, …) plus the Gole options.
 */
export interface GoleNumberFormatOptions extends Intl.NumberFormatOptions {
  /** BCP 47 locale, for example `"en-IN"`. Default: the runtime's locale. */
  locale?: string | string[];
  /** Font build the output is for. Default `"ligature"`. */
  build?: GoleBuild;
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
}

/** A reusable locale-aware Gole formatter, see `createGoleNumberFormat`. */
export interface GoleNumberFormat {
  /** Gole text: `"₹1234.50"` (Ligature build) shows ₹[12][34].[50]. */
  format(value: GoleValue): string;
  /** Gole numbers and the plain text around them (currency sign, `%`, `K`, unit). */
  segments(value: GoleValue): GoleSegment[];
  /** The ordinary decimal text, with thousands separators, for `aria-label`: `"₹1,234.50"`. */
  label(value: GoleValue): string;
  /** One labelled HTML element: digits in `<span class="gole">`, everything else as plain text. */
  html(value: GoleValue, options?: Pick<GoleHTMLOptions, "numberClass" | "digitsClass">): string;
}

type IntlInput = Parameters<Intl.NumberFormat["format"]>[0];

// Strings keep their full precision in engines that support it, so "1863486135148634156" stays exact.
const intlInput = (value: GoleValue) => (typeof value === "string" ? value.trim() : value) as IntlInput;

/**
 * A formatter for currency, percent, units and compact numbers, built on
 * `Intl.NumberFormat`. The locale decides where the currency sign goes, which
 * decimal separator is used and how compact numbers are named.
 *
 * ```ts
 * const inr = createGoleNumberFormat({ locale: "en-IN", style: "currency", currency: "INR" });
 * inr.format(1234.5)   // "₹1234.50"    shows ₹[12][34].[50]
 * inr.label(1234.5)    // "₹1,234.50"
 * ```
 *
 * Thousands separators are left out of the Gole text: Gole symbols already group
 * the digits in pairs. They stay in `label()`.
 */
export function createGoleNumberFormat(options: GoleNumberFormatOptions = {}): GoleNumberFormat {
  const { locale, build, minPairs, ...intl } = options;
  const plain = new Intl.NumberFormat(locale, { ...intl, numberingSystem: "latn" });
  const ungrouped = new Intl.NumberFormat(locale, { ...intl, numberingSystem: "latn", useGrouping: false });
  const goleOptions = { build, minPairs };

  const segments = (value: GoleValue): GoleSegment[] => {
    const out: GoleSegment[] = [];
    let integer: string | null = null;
    let separator = "";
    let fraction: string | null = null;

    const pushText = (text: string) => {
      const last = out[out.length - 1];
      if (last?.type === "text") last.text += text;
      else out.push({ type: "text", text });
    };
    const flush = () => {
      if (integer === null && fraction === null) return;
      const whole = integer ?? "";
      const written = fraction === null ? whole : `${whole}.${fraction}`;
      out.push(numberSegment(written, whole, separator || ".", fraction, goleOptions));
      integer = fraction = null;
      separator = "";
    };

    for (const part of ungrouped.formatToParts(intlInput(value))) {
      switch (part.type as string) {
        case "integer":
          integer = (integer ?? "") + part.value;
          break;
        case "group":
          break;
        case "decimal":
          separator = part.value;
          break;
        case "fraction":
          fraction = (fraction ?? "") + part.value;
          break;
        case "exponentInteger":
          flush();
          out.push(numberSegment(part.value, part.value, "", null, goleOptions));
          break;
        default:
          flush();
          pushText(part.value);
      }
    }
    flush();
    return out;
  };

  const label = (value: GoleValue) => plain.format(intlInput(value));
  return {
    segments,
    label,
    format: (value) =>
      segments(value)
        .map((segment) => segment.text)
        .join(""),
    html: (value, htmlOptions) => segmentsHTML(segments(value), htmlOptions, label(value)),
  };
}

/** One-off locale-aware formatting: `goleFormat(0.456, { style: "percent" })` → `"46%"`, shown as [46]%. */
export function goleFormat(value: GoleValue, options: GoleNumberFormatOptions = {}): string {
  return createGoleNumberFormat(options).format(value);
}

/** The segments of a locale-formatted value, see `createGoleNumberFormat`. */
export function goleFormatSegments(value: GoleValue, options: GoleNumberFormatOptions = {}): GoleSegment[] {
  return createGoleNumberFormat(options).segments(value);
}

/** The ordinary decimal text of a locale-formatted value, for `aria-label`. */
export function goleFormatLabel(value: GoleValue, options: GoleNumberFormatOptions = {}): string {
  return createGoleNumberFormat(options).label(value);
}

/** A locale-formatted value as one labelled HTML element. */
export function goleFormatHTML(value: GoleValue, options: GoleNumberFormatOptions & GoleHTMLOptions = {}): string {
  const { numberClass, digitsClass, decimals: _decimals, decimalSeparator: _separator, grouping: _grouping, ...rest } = options;
  return createGoleNumberFormat(rest).html(value, { numberClass, digitsClass });
}

type Preset = Omit<GoleNumberFormatOptions, "style" | "currency" | "unit" | "notation">;

/**
 * Money: `goleCurrency(1234.5, "INR", { locale: "en-IN" })` → `"₹1234.50"`.
 * The currency decides the number of decimals (2 for INR, 0 for JPY).
 */
export function goleCurrency(value: GoleValue, currency: string, options: Preset = {}): string {
  return goleFormat(value, { ...options, style: "currency", currency });
}

/** A ratio as a percentage: `golePercent(0.456)` → `"46%"`. The value is multiplied by 100, as in `Intl`. */
export function golePercent(value: GoleValue, options: Preset = {}): string {
  return goleFormat(value, { ...options, style: "percent" });
}

/**
 * A short form for large numbers: `goleCompact(1234567)` → `"1.20M"`, shown as [01].[20]M.
 * With `locale: "en-IN"` the names are lakh and crore: `goleCompact(1234567, { locale: "en-IN" })` → `"12L"`.
 */
export function goleCompact(value: GoleValue, options: Preset = {}): string {
  return goleFormat(value, { ...options, notation: "compact" });
}

/**
 * A measurement: `goleUnit(72, "kilometer-per-hour")` → `"72 km/h"`.
 * `unit` is one of the units `Intl.NumberFormat` knows, for example `"kilogram"`, `"celsius"`, `"liter"`.
 */
export function goleUnit(value: GoleValue, unit: string, options: Preset = {}): string {
  return goleFormat(value, { ...options, style: "unit", unit });
}
