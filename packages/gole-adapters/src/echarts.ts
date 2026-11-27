import { goleReady, toGole, type GoleBuild } from "@gole-number-system/gole-core";
import { createGoleAdapterFormat, goleFontStack, tidyNumber, type GoleAdapterOptions, type GoleCanvasOptions } from "./shared";

export { goleFontStack, type GoleAdapterOptions, type GoleCanvasOptions } from "./shared";

const textOptions = ({ build, minPairs, decimalSeparator, grouping }: GoleAdapterOptions) => ({
  build,
  minPairs,
  decimalSeparator,
  grouping,
});

/**
 * A formatter for any ECharts `formatter` callback: numbers get the full options,
 * strings (category names) are converted as text.
 *
 * ```ts
 * const gole = goleEChartsText({ decimals: 1 });
 * gole(12.5)        // "12.50"
 * gole("Week 7")    // "Week 07"
 * ```
 */
export function goleEChartsText(options: GoleAdapterOptions = {}): (value: unknown) => string {
  const format = createGoleAdapterFormat(options);
  const text = textOptions(options);
  return (value) => {
    if (value == null) return "";
    if (typeof value === "number" || typeof value === "bigint") return format.text(tidyNumber(value));
    if (value instanceof Date) return toGole(value.toISOString().slice(0, 10), text);
    return toGole(String(value), text);
  };
}

export interface GoleAxisLabel {
  formatter(value: string | number, index?: number): string;
  fontFamily: string;
}

/**
 * `axisLabel` options for a value, log or category axis.
 *
 * ```ts
 * chart.setOption({
 *   xAxis: { type: "category", data: ["2024", "2025"], axisLabel: goleAxisLabel() },
 *   yAxis: { type: "value", axisLabel: goleAxisLabel() },
 * });
 * ```
 */
export function goleAxisLabel(options: GoleCanvasOptions = {}): GoleAxisLabel {
  const text = goleEChartsText(options);
  return { formatter: (value) => text(value), fontFamily: goleFontStack(options.fallbackFont) };
}

/** The part of ECharts' label callback params that the adapter reads. */
export interface GoleLabelParams {
  value?: unknown;
  encode?: Record<string, number[] | undefined>;
  axisDim?: string;
  dimensionNames?: string[];
}

/** The number a series item stands for: a plain value, or the value dimension of an array / dataset row. */
function itemValue(params: GoleLabelParams): unknown {
  const { value, encode } = params;
  if (value === null || typeof value !== "object") return value;
  const row = value as Record<string | number, unknown>;
  // Cartesian series: the value is on the axis that is not the category (base) axis.
  const dimension =
    encode?.value?.[0] ??
    (params.axisDim === "y" ? encode?.x?.[0] : encode?.y?.[0]) ??
    (Array.isArray(value) ? value.length - 1 : undefined);
  if (dimension === undefined) return undefined;
  return Array.isArray(value) ? value[dimension] : row[params.dimensionNames?.[dimension] ?? dimension];
}

export interface GoleLabel {
  formatter(params: GoleLabelParams): string;
  fontFamily: string;
}

/**
 * `label` options for a series: the value of each bar, point or slice in Gole.
 *
 * ```ts
 * series: [{ type: "bar", data: [120, 200], label: { show: true, position: "top", ...goleLabel() } }]
 * ```
 */
export function goleLabel(options: GoleCanvasOptions = {}): GoleLabel {
  const text = goleEChartsText(options);
  return { formatter: (params) => text(itemValue(params)), fontFamily: goleFontStack(options.fallbackFont) };
}

export interface GoleTooltip {
  valueFormatter(value: unknown): string;
  textStyle: { fontFamily: string };
}

/**
 * Tooltip options that keep ECharts' own layout: values are converted with
 * `valueFormatter` and the whole tooltip uses the Gole font stack, so digits in
 * names and axis values are drawn as Gole symbols too.
 *
 * ```ts
 * tooltip: { trigger: "axis", ...goleTooltip({ decimals: 2 }) }
 * ```
 */
export function goleTooltip(options: GoleCanvasOptions = {}): GoleTooltip {
  const text = goleEChartsText(options);
  return {
    valueFormatter: (value) => (Array.isArray(value) ? value.map(text).join(", ") : text(value)),
    textStyle: { fontFamily: goleFontStack(options.fallbackFont) },
  };
}

/** The part of ECharts' tooltip callback params that the adapter reads. */
export interface GoleTooltipParams extends GoleLabelParams {
  seriesName?: string;
  name?: string;
  marker?: unknown;
  axisValueLabel?: string;
}

/**
 * An HTML tooltip `formatter`. ECharts tooltips are HTML by default, so here the
 * digits get proper markup: `<span class="gole">` for the font and a labelled
 * `role="img"` element around each number. Names are escaped. Needs the Gole
 * stylesheet on the page (it does not apply with `renderMode: "richText"`).
 *
 * ```ts
 * tooltip: { trigger: "axis", ...goleTooltipHTML({ decimals: 2 }) }
 * ```
 */
export function goleTooltipHTML(options: GoleAdapterOptions = {}): {
  formatter(params: GoleTooltipParams | GoleTooltipParams[]): string;
} {
  const format = createGoleAdapterFormat(options);
  const text = createGoleAdapterFormat(textOptions(options));
  const value = (raw: unknown) =>
    raw == null ? "" : typeof raw === "number" ? format.html(tidyNumber(raw)) : format.html(raw);
  // ECharts builds the marker itself (a coloured dot); anything else is dropped.
  const marker = (item: GoleTooltipParams) => (typeof item.marker === "string" ? item.marker : "");
  const line = (item: GoleTooltipParams, name: string | undefined) =>
    `${marker(item)}${name ? text.html(name) + " " : ""}<b>${value(itemValue(item))}</b>`;

  return {
    formatter(params) {
      if (Array.isArray(params)) {
        const first = params[0];
        const title = first ? (first.axisValueLabel ?? first.name ?? "") : "";
        return [title && text.html(title), ...params.map((item) => line(item, item.seriesName))]
          .filter(Boolean)
          .join("<br>");
      }
      const title = params.seriesName ? text.html(params.seriesName) + "<br>" : "";
      return title + line(params, params.name);
    },
  };
}

/** What `goleChartReady` needs from an ECharts instance. */
export interface ResizableChart {
  resize(): void;
  isDisposed?(): boolean;
}

/**
 * Resolves once the GoleStandard font has loaded and, when a chart is given,
 * draws it again. Text drawn on a canvas before the font is ready stays in the
 * fallback font.
 *
 * ```ts
 * const chart = echarts.init(element);
 * chart.setOption(option);
 * goleChartReady(chart);
 *
 * // or wait first, which also gives exact label measurements:
 * await goleChartReady();
 * const chart = echarts.init(element);
 * ```
 */
export async function goleChartReady(chart?: ResizableChart, options: { build?: GoleBuild } = {}): Promise<void> {
  await goleReady(options.build);
  if (chart && !chart.isDisposed?.()) chart.resize();
}
