import { goleReady, toGole, type GoleBuild } from "@gole-number-system/gole-core";
import type { Chart, Plugin, Scale, Tick, TooltipItem, ChartType } from "chart.js";
import { createGoleAdapterFormat, goleFontStack, tidyNumber, type GoleCanvasOptions } from "./shared";

export { goleFontStack, type GoleAdapterOptions, type GoleCanvasOptions } from "./shared";

/** Chart.js's own default font family, used behind the Gole font. */
export const CHARTJS_FALLBACK_FONT = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";

const stack = (options: GoleCanvasOptions) => goleFontStack(options.fallbackFont ?? CHARTJS_FALLBACK_FONT);

/** Options for mixed text (category names, titles): `decimals` and `format` are for numbers only. */
const textOptions = ({ build, minPairs, decimalSeparator, grouping }: GoleCanvasOptions) => ({
  build,
  minPairs,
  decimalSeparator,
  grouping,
});

/**
 * A formatter for anything Chart.js lets you format yourself: numbers get the full
 * options, strings are converted as text (every run of digits is padded).
 *
 * ```ts
 * const gole = goleChartText({ decimals: 1 });
 * gole(12.5)        // "12.50"
 * gole("Week 7")    // "Week 07"
 * ```
 */
export function goleChartText(options: GoleCanvasOptions = {}): (value: unknown) => string {
  const format = createGoleAdapterFormat(options);
  const text = textOptions(options);
  return (value) => {
    if (value == null) return "";
    if (typeof value === "number" || typeof value === "bigint") return format.text(tidyNumber(value));
    return toGole(String(value), text);
  };
}

export interface GoleTicks {
  callback(this: Scale, tickValue: number | string, index: number, ticks: Tick[]): string;
  font: { family: string };
}

/**
 * Tick options for a linear, logarithmic or category scale.
 *
 * ```ts
 * new Chart(canvas, {
 *   type: "bar",
 *   data,
 *   options: { scales: { y: { ticks: goleTicks() }, x: { ticks: goleTicks() } } },
 * });
 * ```
 *
 * On a category scale Chart.js passes the index of the label, so the callback
 * looks the label up and converts the digits in it.
 */
export function goleTicks(options: GoleCanvasOptions = {}): GoleTicks {
  const text = goleChartText(options);
  return {
    callback(tickValue) {
      const isCategory = this?.type === "category" && typeof this.getLabelForValue === "function";
      return text(isCategory ? this.getLabelForValue(Number(tickValue)) : tickValue);
    },
    font: { family: stack(options) },
  };
}

/** A whole scale fragment: `scales: { y: goleScale() }` is `scales: { y: { ticks: goleTicks() } }`. */
export function goleScale(options: GoleCanvasOptions = {}): { ticks: GoleTicks } {
  return { ticks: goleTicks(options) };
}

export interface GoleTooltip {
  callbacks: {
    title(this: unknown, items: TooltipItem<ChartType>[]): string;
    label(this: unknown, item: TooltipItem<ChartType>): string;
  };
  titleFont: { family: string };
  bodyFont: { family: string };
  footerFont: { family: string };
}

/** The number a tooltip item shows: the value on the value axis, or the only number there is. */
function tooltipValue(item: TooltipItem<ChartType>): unknown {
  const parsed = item.parsed as unknown;
  if (parsed === null || typeof parsed !== "object") return parsed ?? item.formattedValue;
  const point = parsed as Record<string, unknown>;
  if (typeof point.r === "number" && point.x === undefined) return point.r;
  const indexAxis =
    (item.dataset as { indexAxis?: string } | undefined)?.indexAxis ??
    (item.chart?.options as { indexAxis?: string } | undefined)?.indexAxis;
  return (indexAxis === "y" ? point.x : point.y) ?? item.formattedValue;
}

/**
 * Tooltip options: the title and every `label: value` line in Gole.
 *
 * ```ts
 * options: { plugins: { tooltip: goleTooltip({ decimals: 2 }) } }
 * ```
 */
export function goleTooltip(options: GoleCanvasOptions = {}): GoleTooltip {
  const text = goleChartText(options);
  const family = stack(options);
  return {
    callbacks: {
      title: (items) => (items[0] ? text(String(items[0].label ?? "")) : ""),
      label: (item) => {
        const name = item.dataset?.label ? text(String(item.dataset.label)) + ": " : "";
        return name + text(tooltipValue(item));
      },
    },
    titleFont: { family },
    bodyFont: { family },
    footerFont: { family },
  };
}

/**
 * Options for chartjs-plugin-datalabels: `plugins: { datalabels: goleDataLabels() }`.
 * Object data points (`{ x, y }`) get no label; pass your own `formatter` built on
 * `goleChartText` for those.
 */
export function goleDataLabels(options: GoleCanvasOptions = {}): {
  formatter(value: unknown): string | null;
  font: { family: string };
} {
  const text = goleChartText(options);
  return {
    formatter: (value) => (value !== null && typeof value === "object" ? null : text(value)),
    font: { family: stack(options) },
  };
}

/**
 * Make the Gole font stack the default for all Chart.js text (ticks, legend, titles,
 * tooltips), so digits everywhere on the chart are drawn as Gole symbols.
 * Returns the stack. Call it once, before creating charts.
 *
 * ```ts
 * import { Chart } from "chart.js/auto";
 * goleChartFont(Chart);
 * ```
 */
export function goleChartFont(chart: { defaults: { font: { family?: string } } }, options: GoleCanvasOptions = {}): string {
  const family = goleFontStack(options.fallbackFont ?? chart.defaults.font.family ?? CHARTJS_FALLBACK_FONT);
  if (!chart.defaults.font.family?.includes("GoleStandard")) chart.defaults.font.family = family;
  return chart.defaults.font.family ?? family;
}

/**
 * Chart.js plugin that draws the chart again once the GoleStandard font has loaded.
 * Text drawn on a canvas before the font is ready stays in the fallback font, so
 * register this plugin (or wait for core's `goleReady()` before creating the chart).
 *
 * ```ts
 * Chart.register(GolePlugin);                                   // all charts
 * new Chart(canvas, { ..., plugins: [GolePlugin] });            // one chart
 * options: { plugins: { gole: { build: "pua" } } }              // when you use the PUA build
 * ```
 */
export const GolePlugin: Plugin<ChartType, { build?: GoleBuild }> = {
  id: "gole",
  afterInit(chart, _args, options) {
    void goleReady(options?.build).then(
      () => {
        // `attached` is false once the chart is destroyed or its canvas left the page.
        if (chart.attached !== false && chart.ctx) redraw(chart);
      },
      () => undefined,
    );
  },
};

/** Lay the chart out again with fresh text measurements and repaint it. */
function redraw(chart: Chart): void {
  for (const scale of Object.values(chart.scales ?? {})) {
    // Label sizes measured in the fallback font are cached per font string.
    (scale as unknown as { _longestTextCache?: object })._longestTextCache = {};
  }
  chart.update("none");
}
