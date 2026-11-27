import { forwardRef, useMemo } from "react";
import { Text, type TextProps } from "react-native";
import { createGoleNumberFormat, type GoleNumberFormatOptions, type GoleValue } from "@gole-number-system/gole-core";
import { useGoleConfig, useGoleFont, type GoleFontProps } from "./context";
import { renderSegments, type GoleComponent, type GoleRef } from "./render";

export interface GoleFormatProps extends Omit<TextProps, "children">, GoleFontProps {
  /** The number to show. */
  value: GoleValue;
  /**
   * `Intl.NumberFormat` options: `{ style: "currency", currency: "INR" }`,
   * `{ notation: "compact" }`, `{ minimumFractionDigits: 2 }`, …
   */
  options?: Intl.NumberFormatOptions;
  /** Locale. Default: from `<GoleProvider>`, otherwise the runtime's locale. */
  locale?: string | string[];
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
  /** Text for screen readers. Default: the ordinary decimal text, such as `"₹1,234.50"`. */
  label?: string;
}

/**
 * A number formatted for a locale, in Gole. The currency sign, percent sign, unit
 * and compact suffix keep the font of the text; only the digits are Gole symbols.
 *
 * ```tsx
 * <GoleFormat value={1234.5} options={{ style: "currency", currency: "INR" }} />  // ₹[12][34].[50]
 * ```
 *
 * Needs `Intl.NumberFormat` with `formatToParts` in the JavaScript engine (see the README
 * for Hermes). For the common cases use `<GoleCurrency>`, `<GolePercent>`, `<GoleCompact>`
 * or `<GoleUnit>`.
 */
export const GoleFormat: GoleComponent<GoleFormatProps> = forwardRef<GoleRef, GoleFormatProps>(function GoleFormat(
  { value, options, locale, minPairs, build, fontFamily, label, ...rest },
  ref,
) {
  const config = useGoleConfig();
  const font = useGoleFont({ build, fontFamily });
  const resolved: GoleNumberFormatOptions = { ...options, locale: locale ?? config.locale, build: font.build, minPairs };
  const key = JSON.stringify(resolved);
  const formatter = useMemo(() => createGoleNumberFormat(resolved), [key]);
  return (
    <Text ref={ref} accessible accessibilityLabel={label ?? formatter.label(value)} {...rest}>
      {renderSegments(formatter.segments(value), font.fontFamily)}
    </Text>
  );
});

type PresetProps = Omit<GoleFormatProps, "options"> & {
  /** Fewest fraction digits to show. */
  minimumFractionDigits?: number;
  /** Most fraction digits to show; the value is rounded to fit. */
  maximumFractionDigits?: number;
};

function preset<P extends PresetProps>(
  name: string,
  toOptions: (props: P) => [Intl.NumberFormatOptions, PresetProps],
): GoleComponent<P> {
  const Component = forwardRef<GoleRef, PresetProps>(function GolePreset(props, ref) {
    const [intl, { minimumFractionDigits, maximumFractionDigits, ...rest }] = toOptions(props as P);
    return <GoleFormat ref={ref} {...rest} options={{ ...intl, minimumFractionDigits, maximumFractionDigits }} />;
  });
  Component.displayName = name;
  return Component;
}

export interface GoleCurrencyProps extends PresetProps {
  /** ISO 4217 code: `"INR"`, `"USD"`, `"EUR"`. */
  currency: string;
  /** How to show the currency: `"symbol"` (₹, default), `"code"` (INR) or `"name"` (Indian rupees). */
  currencyDisplay?: Intl.NumberFormatOptions["currencyDisplay"];
}

/** Money: `<GoleCurrency value={1234.5} currency="INR" />` shows ₹[12][34].[50]. */
export const GoleCurrency = preset<GoleCurrencyProps>("GoleCurrency", ({ currency, currencyDisplay, ...rest }) => [
  { style: "currency", currency, currencyDisplay },
  rest,
]);

export type GolePercentProps = PresetProps;

/** A ratio as a percentage: `<GolePercent value={0.456} />` shows [46]%. The value is multiplied by 100. */
export const GolePercent = preset<GolePercentProps>("GolePercent", (rest) => [{ style: "percent" }, rest]);

export interface GoleCompactProps extends PresetProps {
  /** `"short"` (1.2M, default) or `"long"` (1.2 million). */
  compactDisplay?: Intl.NumberFormatOptions["compactDisplay"];
}

/**
 * A short form for large numbers: `<GoleCompact value={1234567} />` shows [01].[20]M.
 * With `locale="en-IN"` the names are lakh and crore.
 */
export const GoleCompact = preset<GoleCompactProps>("GoleCompact", ({ compactDisplay, ...rest }) => [
  { notation: "compact", compactDisplay },
  rest,
]);

export interface GoleUnitProps extends PresetProps {
  /** A unit `Intl.NumberFormat` knows: `"kilogram"`, `"celsius"`, `"kilometer-per-hour"`, … */
  unit: string;
  /** `"short"` (kg, default), `"narrow"` or `"long"` (kilograms). */
  unitDisplay?: Intl.NumberFormatOptions["unitDisplay"];
}

/** A measurement: `<GoleUnit value={72} unit="kilometer-per-hour" />` shows [72] km/h. */
export const GoleUnit = preset<GoleUnitProps>("GoleUnit", ({ unit, unitDisplay, ...rest }) => [
  { style: "unit", unit, unitDisplay },
  rest,
]);
