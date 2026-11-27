import type { ComponentProps, ReactNode } from "react";
import { Label, LabelList, Legend, Tooltip } from "recharts";
import { toGole } from "@gole-number-system/gole-core";
import { Gole, GoleText } from "@gole-number-system/react-gole";
import { goleFontFamily, isGoleValue, useChartOptions, type GoleChartOptions } from "./options";

function split<P extends GoleChartOptions>(props: P) {
  const { decimals, minPairs, build, decimalSeparator, grouping, ...rest } = props;
  return [{ decimals, minPairs, build, decimalSeparator, grouping }, rest] as const;
}

/** Strings and numbers become Gole; elements a custom formatter returned are kept. */
const inGole = (node: ReactNode, options: GoleChartOptions): ReactNode =>
  typeof node === "number" || typeof node === "bigint" ? (
    <Gole value={node} {...options} />
  ) : typeof node === "string" ? (
    <GoleText {...options}>{node}</GoleText>
  ) : (
    node
  );

export type GoleTooltipProps = ComponentProps<typeof Tooltip> & GoleChartOptions;

/**
 * `Tooltip` whose label and values are shown in Gole. Takes every `Tooltip` prop.
 * Your own `formatter` and `labelFormatter` run first, and whatever text or number
 * they return is converted. `decimals` applies to the values. Series names are left
 * as they are.
 */
export function GoleTooltip(props: GoleTooltipProps) {
  const [chartOptions, rest] = split(props);
  const options = useChartOptions(chartOptions);
  const { decimals, ...textOptions } = options;
  const { formatter, labelFormatter } = rest;

  return (
    <Tooltip
      {...rest}
      formatter={(value, name, item, index, payload) => {
        const result: ReactNode | [ReactNode, ReactNode] = formatter
          ? formatter(value, name, item, index, payload)
          : (value as ReactNode);
        const [shownValue, shownName] = Array.isArray(result) ? result : [result, name as ReactNode];
        // Recharts only prints a series name that is a string or a number, so the name stays as it is.
        return [inGole(shownValue, options), shownName];
      }}
      labelFormatter={(label, payload) =>
        inGole(labelFormatter ? labelFormatter(label, payload) : label, textOptions)
      }
    />
  );
}

export type GoleLegendProps = ComponentProps<typeof Legend> & Omit<GoleChartOptions, "decimals">;

/** `Legend` whose entries show their numbers in Gole, for series named `2025`, `Q3 2026` and so on. */
export function GoleLegend(props: GoleLegendProps) {
  const [chartOptions, rest] = split(props);
  const options = useChartOptions(chartOptions);
  const { formatter } = rest;
  return (
    <Legend
      {...rest}
      formatter={(value, entry, index) => inGole(formatter ? formatter(value, entry, index) : value, options)}
    />
  );
}

interface SvgLabelOptions extends GoleChartOptions {
  /** Font for the decimal point, minus sign and any letters in the label. Default `system-ui, sans-serif`. */
  fallbackFont?: string;
}

export type GoleLabelListProps = ComponentProps<typeof LabelList> & SvgLabelOptions;

/**
 * `LabelList` with the data labels in Gole: put it inside `<Bar>`, `<Line>`, `<Area>`,
 * `<Scatter>` or `<Pie>`. Takes every `LabelList` prop; your own `formatter` runs first.
 */
export function GoleLabelList({ fallbackFont, ...props }: GoleLabelListProps) {
  const [chartOptions, rest] = split(props);
  const options = useChartOptions(chartOptions);
  const { formatter } = rest;
  return (
    <LabelList
      fontFamily={goleFontFamily(fallbackFont)}
      {...rest}
      formatter={(label) => {
        const value = formatter ? formatter(label) : label;
        return isGoleValue(value) ? toGole(value, options) : value;
      }}
    />
  );
}

export type GoleLabelProps = ComponentProps<typeof Label> & SvgLabelOptions;

/**
 * `Label` in Gole, for reference lines, axis titles and the centre of a pie:
 * `<ReferenceLine y={target}><GoleLabel value={target} position="insideTopRight" /></ReferenceLine>`.
 */
export function GoleLabel({ fallbackFont, ...props }: GoleLabelProps) {
  const [chartOptions, rest] = split(props);
  const options = useChartOptions(chartOptions);
  const { formatter } = rest;
  return (
    <Label
      fontFamily={goleFontFamily(fallbackFont)}
      {...rest}
      formatter={(label) => {
        const value = formatter ? formatter(label) : label;
        return isGoleValue(value) ? toGole(value, options) : value;
      }}
    />
  );
}
