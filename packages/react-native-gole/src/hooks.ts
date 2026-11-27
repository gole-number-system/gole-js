import { useMemo } from "react";
import { goleSegments, type GoleOptions, type GoleSegment, type GoleValue } from "@gole-number-system/gole-core";
import { useGoleConfig, useGoleFont, type GoleFontProps } from "./context";

export interface UseGoleResult {
  /** Text to display. Only the digits in it have glyphs in the Gole font; see `segments`. */
  text: string;
  /** The decimal text it stands for, for `accessibilityLabel`. */
  label: string;
  /** The digit pairs behind the symbols. */
  pairs: string[];
  /** Number of Gole symbols. */
  count: number;
  /** Numbers and the text between them, for custom rendering. */
  segments: GoleSegment[];
  /** The `fontFamily` to put on the digits. */
  fontFamily: string;
}

/**
 * Convert a value for custom rendering, using the build and font family from `<GoleProvider>`.
 * Use it where a component cannot go: SVG text, charts, your own `<Text>` layout.
 *
 * ```tsx
 * const { text, label, fontFamily } = useGole(42);
 * <Text style={{ fontFamily }} accessibilityLabel={label}>{text}</Text>
 * ```
 */
export function useGole(value: GoleValue, options: GoleOptions & Pick<GoleFontProps, "fontFamily"> = {}): UseGoleResult {
  const config = useGoleConfig();
  const { build, fontFamily } = useGoleFont(options);
  const { decimals, minPairs } = options;
  const decimalSeparator = options.decimalSeparator ?? config.decimalSeparator;
  const grouping = options.grouping ?? config.grouping;
  return useMemo(() => {
    const segments = goleSegments(value, { build, decimals, minPairs, decimalSeparator, grouping });
    const pairs = segments.flatMap((segment) => (segment.type === "number" ? segment.pairs : []));
    return {
      text: segments.map((segment) => segment.text).join(""),
      label: segments.map((segment) => (segment.type === "number" ? segment.value : segment.text)).join(""),
      pairs,
      count: pairs.length,
      segments,
      fontFamily,
    };
  }, [value, build, fontFamily, decimals, minPairs, decimalSeparator, grouping]);
}
