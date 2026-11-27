import { useEffect, useMemo, useState } from "react";
import {
  goleReady,
  goleSegments,
  type GoleBuild,
  type GoleOptions,
  type GoleSegment,
  type GoleValue,
} from "@gole-number-system/gole-core";
import { useGoleConfig, useGoleOptions } from "./context";

export interface UseGoleResult {
  /** Text to display in the Gole font. */
  text: string;
  /** The decimal text it stands for, for `aria-label`. */
  label: string;
  /** The digit pairs behind the symbols. */
  pairs: string[];
  /** Number of Gole symbols. */
  count: number;
  /** Numbers and the text between them, for custom rendering. */
  segments: GoleSegment[];
}

/**
 * Convert a value for custom rendering, using the build from `<GoleProvider>`.
 * Use it where a component cannot go: canvas, SVG attributes, `title`, document titles.
 */
export function useGole(value: GoleValue, options: GoleOptions = {}): UseGoleResult {
  const { build, decimals, minPairs, decimalSeparator, grouping } = useGoleOptions(options);
  return useMemo(() => {
    const segments = goleSegments(value, { build, decimals, minPairs, decimalSeparator, grouping });
    const pairs = segments.flatMap((segment) => (segment.type === "number" ? segment.pairs : []));
    return {
      text: segments.map((segment) => segment.text).join(""),
      label: segments.map((segment) => (segment.type === "number" ? segment.value : segment.text)).join(""),
      pairs,
      count: pairs.length,
      segments,
    };
  }, [value, build, decimals, minPairs, decimalSeparator, grouping]);
}

/**
 * `true` once the GoleStandard font has loaded. Wait for it before measuring text
 * widths, drawing to a canvas or taking a screenshot.
 */
export function useGoleFontReady(build?: GoleBuild): boolean {
  const config = useGoleConfig();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    goleReady(build ?? config.build).then(
      () => !cancelled && setReady(true),
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [build, config.build]);
  return ready;
}
