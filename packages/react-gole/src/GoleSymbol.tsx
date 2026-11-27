import { forwardRef, type HTMLAttributes } from "react";
import { goleSymbol, type GoleBuild } from "@gole-number-system/gole-core";
import { useGoleConfig } from "./context";
import { cx } from "./render";

export interface GoleSymbolProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** An integer from 0 to 99. */
  value: number;
  build?: GoleBuild;
}

/** A single Gole symbol, for glyph tables, legends and teaching material: `<GoleSymbol value={35} />`. */
export const GoleSymbol = forwardRef<HTMLSpanElement, GoleSymbolProps>(function GoleSymbol(
  { value, build, className, ...rest },
  ref,
) {
  const config = useGoleConfig();
  return (
    <span ref={ref} role="img" aria-label={String(value)} {...rest} className={cx("gole", "gole-symbol", className)}>
      {goleSymbol(value, build ?? config.build)}
    </span>
  );
});
