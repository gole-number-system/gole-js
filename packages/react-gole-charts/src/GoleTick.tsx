import type { SVGProps } from "react";
import { goleLabel, goleSegments, GOLE_FONT_FAMILY } from "@gole-number-system/gole-core";
import { isGoleValue, useChartOptions, type GoleChartOptions } from "./options";

/** What Recharts passes to a custom tick. All of it is filled in by the axis. */
interface TickRenderProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: unknown };
  index?: number;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  verticalAnchor?: "start" | "middle" | "end";
  fill?: string;
  angle?: number;
  className?: string;
  tickFormatter?: (value: any, index: number) => string;
}

export interface GoleTickProps extends GoleChartOptions, TickRenderProps {
  /** Extra attributes for the `<text>` element: `fontSize`, `fill`, `fontWeight`… */
  textProps?: SVGProps<SVGTextElement>;
}

// Same offsets Recharts' own <Text> uses to align one line of text.
const DY = { start: "0.71em", middle: "0.355em", end: "0em" } as const;

/**
 * An axis tick label in Gole. Pass it to the `tick` prop of any Recharts axis:
 *
 * ```tsx
 * <XAxis dataKey="year" tick={<GoleTick />} />
 * ```
 *
 * Only the digits are set in the Gole font. Month names, units, decimal points and
 * minus signs keep the font of the chart, so `"Mar 2026"` and `"−4.5 °C"` look right.
 * The axis's own `tickFormatter` runs first. `<GoleXAxis>` and `<GoleYAxis>` use this for you.
 */
export function GoleTick(props: GoleTickProps) {
  const options = useChartOptions(props);
  const { x = 0, y = 0, payload, index = 0, textAnchor, verticalAnchor = "end", fill, angle, tickFormatter } = props;
  const raw = payload?.value;
  const value = tickFormatter ? tickFormatter(raw, index) : raw;
  if (!isGoleValue(value)) return null;

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      stroke="none"
      textAnchor={textAnchor}
      transform={angle ? `rotate(${angle}, ${x}, ${y})` : undefined}
      aria-label={goleLabel(value, options)}
      {...props.textProps}
      className={["recharts-text", "gole-tick", props.className, props.textProps?.className].filter(Boolean).join(" ")}
    >
      <tspan x={x} dy={DY[verticalAnchor]}>
        {goleSegments(value, options).map((segment, i) =>
          segment.type === "text" ? (
            segment.text
          ) : (
            <tspan key={i}>
              <tspan fontFamily={GOLE_FONT_FAMILY}>{segment.integer}</tspan>
              {segment.separator}
              {segment.fraction && <tspan fontFamily={GOLE_FONT_FAMILY}>{segment.fraction}</tspan>}
            </tspan>
          ),
        )}
      </tspan>
    </text>
  );
}
