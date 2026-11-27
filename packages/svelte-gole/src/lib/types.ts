import type { HTMLAttributes, HTMLTimeAttributes } from "svelte/elements";
import type { GoleBuild, GoleDateInput, GoleOptions, GoleValue } from "@gole-number-system/gole-core";

type ElementProps = Omit<HTMLAttributes<HTMLElement>, "children" | "class"> & {
  class?: string;
};

export interface GoleProps extends ElementProps {
  /** The number to show: `123`, `"12.5"`, `10n`. Dates, times and codes such as `"12:05"` also work. */
  value: GoleValue;
  /** Fixed number of fraction digits, rounded half away from zero. */
  decimals?: number;
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
  /** Font build. Default: from `setGoleContext`, otherwise `"ligature"`. */
  build?: GoleBuild;
  /** Text for screen readers. Default: the decimal value. */
  label?: string;
  /** Element to render. Default `"span"`. */
  tag?: string;
}

export interface GoleTextProps extends ElementProps {
  /** Text in which every run of digits is shown in Gole. */
  text: string;
  build?: GoleBuild;
  minPairs?: number;
  /** Decimal separator. Default `"."`; `false` treats every run of digits as a whole number. */
  decimalSeparator?: GoleOptions["decimalSeparator"];
  /** Thousands separator to remove, for example `","`. Default: none. */
  grouping?: GoleOptions["grouping"];
  /** Element to render. Default `"span"`. */
  tag?: string;
}

export interface GoleSymbolProps extends ElementProps {
  /** An integer from 0 to 99. */
  value: number;
  build?: GoleBuild;
}

interface DateTimeProps extends Omit<HTMLTimeAttributes, "children" | "class" | "datetime"> {
  class?: string;
  /**
   * A pattern of the tokens `YYYY YY MM DD HH hh mm ss A`, or `Intl.DateTimeFormat`
   * options for locale-aware text such as `{ dateStyle: "medium" }`.
   */
  format?: string | Intl.DateTimeFormatOptions;
  /** Locale for `Intl.DateTimeFormat` options. Default: from `setGoleContext`, otherwise the runtime's locale. */
  locale?: string | string[];
  /** Read the date in UTC instead of local time. */
  utc?: boolean;
  build?: GoleBuild;
}

export interface GoleDateProps extends DateTimeProps {
  /** A `Date`, a timestamp or a date string. */
  value: GoleDateInput;
}

export interface GoleTimeProps extends DateTimeProps {
  /** A fixed time to show. Leave out for a live clock that shows the current time. */
  value?: GoleDateInput;
  /** How often a live clock updates, in milliseconds. Default `1000`. */
  interval?: number;
}

export interface GoleFormatProps extends ElementProps {
  /** The number to show. */
  value: GoleValue;
  /**
   * `Intl.NumberFormat` options: `{ style: "currency", currency: "INR" }`,
   * `{ notation: "compact" }`, `{ minimumFractionDigits: 2 }`, …
   */
  options?: Intl.NumberFormatOptions;
  /** Locale. Default: from `setGoleContext`, otherwise the runtime's locale. */
  locale?: string | string[];
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
  /** Font build. Default: from `setGoleContext`, otherwise `"ligature"`. */
  build?: GoleBuild;
  /** Text for screen readers. Default: the ordinary decimal text, such as `"₹1,234.50"`. */
  label?: string;
  /** Element to render. Default `"span"`. */
  tag?: string;
}

type PresetProps = Omit<GoleFormatProps, "options"> & {
  /** Fewest fraction digits to show. */
  minimumFractionDigits?: number;
  /** Most fraction digits to show; the value is rounded to fit. */
  maximumFractionDigits?: number;
};

export interface GoleCurrencyProps extends PresetProps {
  /** ISO 4217 code: `"INR"`, `"USD"`, `"EUR"`. */
  currency: string;
  /** How to show the currency: `"symbol"` (₹, default), `"code"` (INR) or `"name"` (Indian rupees). */
  currencyDisplay?: Intl.NumberFormatOptions["currencyDisplay"];
}

export type GolePercentProps = PresetProps;

export interface GoleCompactProps extends PresetProps {
  /** `"short"` (1.2M, default) or `"long"` (1.2 million). */
  compactDisplay?: Intl.NumberFormatOptions["compactDisplay"];
}

export interface GoleUnitProps extends PresetProps {
  /** A unit `Intl.NumberFormat` knows: `"kilogram"`, `"celsius"`, `"kilometer-per-hour"`, … */
  unit: string;
  /** `"short"` (kg, default), `"narrow"` or `"long"` (kilograms). */
  unitDisplay?: Intl.NumberFormatOptions["unitDisplay"];
}
