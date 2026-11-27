import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  goleLabel,
  goleSegments,
  goleSymbol,
  type GoleBuild,
  type GoleNumberSegment,
  type GoleValue,
} from "@gole-number-system/gole-core";
import { useGoleOptions } from "./context";
import { cx } from "./render";

export interface GolePairsProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  value: GoleValue;
  decimals?: number;
  minPairs?: number;
  build?: GoleBuild;
  /** Show the two decimal digits under each symbol. Default `true`. */
  showDigits?: boolean;
}

/** Which pairs contain padding zeros: the leading whole pairs, or the last fraction pair. */
function paddedPair(segment: GoleNumberSegment, index: number): "left" | "right" | undefined {
  if (index < Math.ceil(segment.padLeft / 2)) return "left";
  if (segment.padRight && index === segment.pairs.length - 1) return "right";
  return undefined;
}

/**
 * A number broken into its pairs, one box per Gole symbol with the decimal digits
 * underneath. The box holding a padding zero gets `data-pad="left"` or `"right"`.
 * Useful for teaching, onboarding and debugging: `<GolePairs value={123} />` shows
 * `[01][23]` with the first box marked as padded.
 */
export const GolePairs = forwardRef<HTMLOListElement, GolePairsProps>(function GolePairs(
  { value, decimals, minPairs, build, showDigits = true, className, ...rest },
  ref,
) {
  const options = useGoleOptions({ build, decimals, minPairs });
  const items: ReactNode[] = [];
  const text = (content: string) =>
    items.push(
      <li className="gole-pair-text" aria-hidden="true" key={items.length}>
        {content}
      </li>,
    );

  for (const segment of goleSegments(value, options)) {
    if (segment.type === "text") {
      text(segment.text);
      continue;
    }
    segment.pairs.forEach((pair, i) => {
      if (segment.separator && i === segment.integerPairs) text(segment.separator);
      items.push(
        <li className="gole-pair" data-pad={paddedPair(segment, i)} aria-hidden="true" key={items.length}>
          <span className="gole">{goleSymbol(Number(pair), options.build)}</span>
          {showDigits && <small className="gole-pair-digits">{pair}</small>}
        </li>,
      );
    });
  }

  return (
    <ol ref={ref} role="img" aria-label={goleLabel(value, options)} {...rest} className={cx("gole-pairs", className)}>
      {items}
    </ol>
  );
});
