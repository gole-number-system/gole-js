import { forwardRef, useMemo, type ElementType, type HTMLAttributes } from "react";
import {
  createGoleNumberFormat,
  type GoleBuild,
  type GoleNumberFormatOptions,
  type GoleValue,
} from "@gole-number-system/gole-core";
import { useGoleConfig } from "./context";
import { cx, renderFlat } from "./render";

export interface GoleFormatProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** The number to show. */
  value: GoleValue;
  /**
   * `Intl.NumberFormat` options: `{ style: "currency", currency: "INR" }`,
   * `{ notation: "compact" }`, `{ minimumFractionDigits: 2 }`, …
   * Pass a stable object (a constant or `useMemo`) to avoid rebuilding the formatter.
   */
  options?: Intl.NumberFormatOptions;
  /** Locale. Default: from `<GoleProvider>`, otherwise the runtime's locale. */
  locale?: string | string[];
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
  /** Font build. Default: from `<GoleProvider>`, otherwise `"ligature"`. */
  build?: GoleBuild;
  /** Element to render. Default `"span"`. */
  as?: ElementType;
  /** Text for screen readers. Default: the ordinary decimal text, such as `"₹1,234.50"`. */
  label?: string;
}

/**
 * A number formatted for a locale, in Gole. The currency sign, percent sign, unit
 * and compact suffix keep the page font; only the digits are Gole symbols.
 *
 * ```tsx
 * <GoleFormat value={1234.5} options={{ style: "currency", currency: "INR" }} />  // ₹[12][34].[50]
 * ```
 *
 * For the common cases use `<GoleCurrency>`, `<GolePercent>`, `<GoleCompact>` or `<GoleUnit>`.
 */
export const GoleFormat = forwardRef<HTMLElement, GoleFormatProps>(function GoleFormat(
  { value, options, locale, minPairs, build, as: Tag = "span", label, className, ...rest },
  ref,
) {
  const config = useGoleConfig();
  const resolved: GoleNumberFormatOptions = {
    ...options,
    locale: locale ?? config.locale,
    build: build ?? config.build,
    minPairs,
  };
  const key = JSON.stringify(resolved);
  const formatter = useMemo(() => createGoleNumberFormat(resolved), [key]);
  const text = label ?? formatter.label(value);
  return (
    <Tag ref={ref} role="img" aria-label={text} data-value={text} {...rest} className={cx("gole-number", className)}>
      {renderFlat(formatter.segments(value))}
    </Tag>
  );
});

type PresetProps = Omit<GoleFormatProps, "options"> & {
  /** Fewest fraction digits to show. */
  minimumFractionDigits?: number;
  /** Most fraction digits to show; the value is rounded to fit. */
  maximumFractionDigits?: number;
};

function preset<P extends PresetProps>(name: string, toOptions: (props: P) => [Intl.NumberFormatOptions, PresetProps]) {
  const Component = forwardRef<HTMLElement, P>(function GolePreset(props, ref) {
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
