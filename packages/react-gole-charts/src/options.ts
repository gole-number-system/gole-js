import { GOLE_FONT_FAMILY, toGole, type GoleOptions, type GoleValue } from "@gole-number-system/gole-core";
import { useGoleConfig } from "@gole-number-system/react-gole";

/** Options shared by every Gole chart component. */
export interface GoleChartOptions {
  /** Fixed number of fraction digits for numeric values, rounded half away from zero. */
  decimals?: number;
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
  /** Font build. Default: from `<GoleProvider>`, otherwise `"ligature"`. */
  build?: GoleOptions["build"];
  /** Decimal separator in text values. Default `"."`; `false` treats every run of digits as a whole number. */
  decimalSeparator?: GoleOptions["decimalSeparator"];
  /** Thousands separator to remove from text values, for example `","`. */
  grouping?: GoleOptions["grouping"];
}

/** Pick the Gole options out of a props object and fill the build from `<GoleProvider>`. */
export function useChartOptions(props: GoleChartOptions): GoleOptions {
  const config = useGoleConfig();
  return {
    build: props.build ?? config.build,
    decimals: props.decimals,
    minPairs: props.minPairs,
    decimalSeparator: props.decimalSeparator ?? config.decimalSeparator,
    grouping: props.grouping ?? config.grouping,
  };
}

export const isGoleValue = (value: unknown): value is GoleValue =>
  typeof value === "number" || typeof value === "string" || typeof value === "bigint";

/**
 * `font-family` for SVG text that is set as one string, such as data labels:
 * GoleStandard for the digits, then a fallback for the decimal point and minus sign.
 */
export const goleFontFamily = (fallback = "system-ui, sans-serif") => `"${GOLE_FONT_FAMILY}", ${fallback}`;

/**
 * A formatter for any Recharts `formatter` / `tickFormatter` prop that returns a string.
 * Remember to also set the Gole font on that text, for example with `goleFontFamily()`.
 *
 * ```tsx
 * <Label value={total} formatter={goleFormatter({ decimals: 2 })} fontFamily={goleFontFamily()} />
 * ```
 */
export function goleFormatter(options: GoleOptions = {}) {
  return (value: unknown): string => (isGoleValue(value) ? toGole(value, options) : String(value ?? ""));
}
