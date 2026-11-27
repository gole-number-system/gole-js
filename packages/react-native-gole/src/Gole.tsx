import { forwardRef } from "react";
import { Text, type TextProps } from "react-native";
import { goleLabel, goleSegments, goleSymbol, type GoleOptions, type GoleValue } from "@gole-number-system/gole-core";
import { useGoleConfig, useGoleFont, type GoleFontProps } from "./context";
import { renderSegments, type GoleComponent, type GoleRef } from "./render";

export interface GoleProps extends Omit<TextProps, "children">, GoleFontProps {
  /** The number to show: `123`, `"12.5"`, `10n`. Dates, times and codes such as `"12:05"` also work. */
  value: GoleValue;
  /** Fixed number of fraction digits, rounded half away from zero. */
  decimals?: number;
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
  /** Text for screen readers. Default: the decimal value. */
  label?: string;
}

/**
 * One number in Gole, as a `<Text>`.
 *
 * ```tsx
 * <Gole value={987654} />               // [98][76][54]
 * <Gole value={12747.2} decimals={2} /> // [01][27][47].[20]
 * <Gole value={-4.5} style={{ fontSize: 24 }} />
 * ```
 *
 * The padding is added for you. Screen readers get the decimal value.
 */
export const Gole: GoleComponent<GoleProps> = forwardRef<GoleRef, GoleProps>(function Gole(
  { value, decimals, minPairs, build, fontFamily, label, ...rest },
  ref,
) {
  const font = useGoleFont({ build, fontFamily });
  const options = { build: font.build, decimals, minPairs };
  return (
    <Text ref={ref} accessible accessibilityLabel={label ?? goleLabel(value, options)} {...rest}>
      {renderSegments(goleSegments(value, options), font.fontFamily)}
    </Text>
  );
});

export interface GoleTextProps extends Omit<TextProps, "children">, GoleFontProps {
  /** Text. Every run of digits in it is shown in Gole. */
  children?: string | number | Array<string | number>;
  minPairs?: number;
  /** Decimal separator. Default `"."`; `false` treats every run of digits as a whole number. */
  decimalSeparator?: GoleOptions["decimalSeparator"];
  /** Thousands separator to remove, for example `","`. Default: none. */
  grouping?: GoleOptions["grouping"];
}

/**
 * Mixed text with every number shown in Gole. Letters, punctuation and units keep
 * the font of the text; each run of digits is padded on its own.
 *
 * ```tsx
 * <GoleText>Invoice 5055-002347 · 20/11/2026 · 12:05</GoleText>
 * <GoleText grouping=",">Total 1,234.5 kg</GoleText>
 * <GoleText>Ships in {days} days</GoleText>
 * ```
 */
export const GoleText: GoleComponent<GoleTextProps> = forwardRef<GoleRef, GoleTextProps>(function GoleText(
  { children, minPairs, decimalSeparator, grouping, build, fontFamily, ...rest },
  ref,
) {
  const config = useGoleConfig();
  const font = useGoleFont({ build, fontFamily });
  // "Total: {count}" arrives as an array; it is joined first so it converts as one text.
  const text = Array.isArray(children) ? children.join("") : String(children ?? "");
  const segments = goleSegments(text, {
    build: font.build,
    minPairs,
    decimalSeparator: decimalSeparator ?? config.decimalSeparator,
    grouping: grouping ?? config.grouping,
  });
  return (
    <Text ref={ref} accessible accessibilityLabel={text} {...rest}>
      {renderSegments(segments, font.fontFamily)}
    </Text>
  );
});

export interface GoleSymbolProps extends Omit<TextProps, "children">, GoleFontProps {
  /** An integer from 0 to 99. */
  value: number;
}

/** A single Gole symbol, for glyph tables, legends and teaching material: `<GoleSymbol value={35} />`. */
export const GoleSymbol: GoleComponent<GoleSymbolProps> = forwardRef<GoleRef, GoleSymbolProps>(function GoleSymbol(
  { value, build, fontFamily, ...rest },
  ref,
) {
  const font = useGoleFont({ build, fontFamily });
  return (
    <Text ref={ref} accessible accessibilityLabel={String(value)} {...rest}>
      <Text style={{ fontFamily: font.fontFamily }}>{goleSymbol(value, font.build)}</Text>
    </Text>
  );
});
