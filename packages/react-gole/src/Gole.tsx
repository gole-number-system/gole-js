import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { goleLabel, goleSegments, type GoleBuild, type GoleValue } from "@gole-number-system/gole-core";
import { useGoleOptions } from "./context";
import { cx, renderFlat } from "./render";

export interface GoleProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** The number to show: `123`, `"12.5"`, `10n`. Dates, times and codes such as `"12:05"` also work. */
  value: GoleValue;
  /** Fixed number of fraction digits, rounded half away from zero. */
  decimals?: number;
  /** Minimum number of Gole symbols in the whole part. */
  minPairs?: number;
  /** Font build. Default: from `<GoleProvider>`, otherwise `"ligature"`. */
  build?: GoleBuild;
  /** Element to render. Default `"span"`. */
  as?: ElementType;
  /** Text for screen readers. Default: the decimal value. */
  label?: string;
}

/**
 * One number in Gole.
 *
 * ```tsx
 * <Gole value={987654} />               // [98][76][54]
 * <Gole value={12747.2} decimals={2} /> // [01][27][47].[20]
 * <Gole value={-4.5} />                 // −[04].[50]
 * ```
 *
 * The padding is added for you. Screen readers get the decimal value, and with the
 * Ligature build copy-paste gives plain digits.
 */
export const Gole = forwardRef<HTMLElement, GoleProps>(function Gole(
  { value, decimals, minPairs, build, as: Tag = "span", label, className, ...rest },
  ref,
) {
  const options = useGoleOptions({ build, decimals, minPairs });
  const text = label ?? goleLabel(value, options);
  return (
    <Tag ref={ref} role="img" aria-label={text} data-value={text} {...rest} className={cx("gole-number", className)}>
      {renderFlat(goleSegments(value, options))}
    </Tag>
  );
});
