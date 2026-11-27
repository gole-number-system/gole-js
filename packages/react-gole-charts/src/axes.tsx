import { isValidElement, type ComponentProps, type SVGProps } from "react";
import { PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis } from "recharts";
import { GoleTick } from "./GoleTick";
import type { GoleChartOptions } from "./options";

/**
 * The `tick` prop for a Gole axis. `false`, a custom element and a render function are
 * left alone; `true`, `undefined` and a props object become a `<GoleTick>`.
 */
function goleTick<T>(tick: T, options: GoleChartOptions): T {
  if (tick === false || isValidElement(tick) || typeof tick === "function") return tick;
  const textProps = typeof tick === "object" && tick !== null ? (tick as SVGProps<SVGTextElement>) : undefined;
  return (<GoleTick {...options} textProps={textProps} />) as T;
}

function split<P extends GoleChartOptions>(props: P) {
  const { decimals, minPairs, build, decimalSeparator, grouping, ...rest } = props;
  return [{ decimals, minPairs, build, decimalSeparator, grouping }, rest] as const;
}

export type GoleXAxisProps = ComponentProps<typeof XAxis> & GoleChartOptions;

/**
 * `XAxis` with tick labels in Gole. Takes every `XAxis` prop, plus the Gole options.
 * A `tick` props object styles the label; `tickFormatter` runs before the conversion.
 */
export function GoleXAxis(props: GoleXAxisProps) {
  const [options, rest] = split(props);
  return <XAxis {...rest} tick={goleTick(rest.tick, options)} />;
}

export type GoleYAxisProps = ComponentProps<typeof YAxis> & GoleChartOptions;

/** `YAxis` with tick labels in Gole. Takes every `YAxis` prop, plus the Gole options. */
export function GoleYAxis(props: GoleYAxisProps) {
  const [options, rest] = split(props);
  return <YAxis {...rest} tick={goleTick(rest.tick, options)} />;
}

export type GolePolarAngleAxisProps = ComponentProps<typeof PolarAngleAxis> & GoleChartOptions;

/** `PolarAngleAxis` (radar and radial charts) with tick labels in Gole. */
export function GolePolarAngleAxis(props: GolePolarAngleAxisProps) {
  const [options, rest] = split(props);
  return <PolarAngleAxis {...rest} tick={goleTick(rest.tick, options)} />;
}

export type GolePolarRadiusAxisProps = ComponentProps<typeof PolarRadiusAxis> & GoleChartOptions;

/** `PolarRadiusAxis` (radar and radial charts) with tick labels in Gole. */
export function GolePolarRadiusAxis(props: GolePolarRadiusAxisProps) {
  const [options, rest] = split(props);
  return <PolarRadiusAxis {...rest} tick={goleTick(rest.tick, options)} />;
}
