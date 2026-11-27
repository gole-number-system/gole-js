import { toGole } from "@gole-number-system/gole-core";
import * as echarts from "echarts";
import { describe, expect, it, vi } from "vitest";
import {
  goleAxisLabel,
  goleChartReady,
  goleEChartsText,
  goleLabel,
  goleTooltip,
  goleTooltipHTML,
} from "../src/echarts";

describe("goleAxisLabel", () => {
  it("formats numbers and converts category text", () => {
    const { formatter, fontFamily } = goleAxisLabel({ decimals: 2 });
    expect(formatter(150)).toBe("0150.00");
    expect(formatter("Q1 2026")).toBe("Q01 2026");
    expect(formatter("2025")).toBe("2025");
    expect(fontFamily).toBe('"GoleStandard", sans-serif');
  });

  it("supports formats, the PUA build and a fallback font", () => {
    expect(goleAxisLabel({ format: { locale: "en-US", style: "percent" } }).formatter(0.46)).toBe("46%");
    expect(goleAxisLabel({ build: "pua" }).formatter(123)).toBe(toGole(123, { build: "pua" }));
    expect(goleAxisLabel({ fallbackFont: "Inter" }).fontFamily).toBe('"GoleStandard", Inter');
    expect(goleAxisLabel().formatter(0.1 + 0.2)).toBe("00.30");
  });
});

describe("goleEChartsText", () => {
  it("handles empty values and dates", () => {
    const text = goleEChartsText();
    expect(text(null)).toBe("");
    expect(text(undefined)).toBe("");
    expect(text(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05");
  });
});

describe("goleLabel", () => {
  const { formatter, fontFamily } = goleLabel();

  it("formats the value of a data item", () => {
    expect(formatter({ value: 120 })).toBe("0120");
    expect(formatter({ value: "7" })).toBe("07");
    expect(formatter({ value: null })).toBe("");
    expect(fontFamily).toBe('"GoleStandard", sans-serif');
  });

  it("picks the value dimension of array and dataset rows", () => {
    expect(formatter({ value: ["Mon", 120], encode: { x: [0], y: [1] } })).toBe("0120");
    expect(formatter({ value: [120, "Mon"], encode: { x: [0], y: [1] }, axisDim: "y" })).toBe("0120");
    expect(formatter({ value: [3, 5, 9] })).toBe("09");
    expect(formatter({ value: ["A", 42], encode: { itemName: [0], value: [1] } })).toBe("42");
    expect(
      formatter({ value: { day: "Mon", sales: 7 }, encode: { x: [0], y: [1] }, dimensionNames: ["day", "sales"] }),
    ).toBe("07");
  });
});

describe("goleTooltip", () => {
  it("returns a value formatter and the font stack", () => {
    const tooltip = goleTooltip({ decimals: 2, fallbackFont: "Inter" });
    expect(tooltip.valueFormatter(1234.5)).toBe("1234.50");
    expect(tooltip.valueFormatter([1, 20])).toBe("01.00, 20.00");
    expect(tooltip.valueFormatter(null)).toBe("");
    expect(tooltip.textStyle.fontFamily).toBe('"GoleStandard", Inter');
  });
});

describe("goleTooltipHTML", () => {
  const marker = '<span style="background:#5470c6"></span>';

  it("builds an axis tooltip with Gole markup", () => {
    const { formatter } = goleTooltipHTML({ decimals: 2 });
    const html = formatter([
      { axisValueLabel: "2026", name: "2026", seriesName: "Sales", value: 1234.5, marker },
      { axisValueLabel: "2026", name: "2026", seriesName: "Cost", value: 7, marker },
    ]);
    const lines = html.split("<br>");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('<span class="gole-number" role="img" aria-label="2026"><span class="gole">2026</span></span>');
    expect(lines[1]).toBe(
      `${marker}Sales <b><span class="gole-number" role="img" aria-label="1234.50"><span class="gole">1234</span>.<span class="gole">50</span></span></b>`,
    );
    expect(lines[2]).toContain('aria-label="7.00"');
  });

  it("builds an item tooltip and escapes names", () => {
    const { formatter } = goleTooltipHTML({ format: { locale: "en-IN", style: "currency", currency: "INR" } });
    const html = formatter({ seriesName: "<img src=x onerror=alert(1)>", name: "A&B 7", value: 1234.5, marker });
    expect(html).not.toContain("<img");
    expect(html).toContain("&#60;img");
    expect(html).toContain("A&#38;B ");
    expect(html).toContain('aria-label="₹1,234.50"');
    expect(html).toContain('₹<span class="gole">1234</span>.<span class="gole">50</span>');
  });

  it("escapes string values and ignores a marker that is not a string", () => {
    const { formatter } = goleTooltipHTML();
    const html = formatter({ name: "x", value: "<b>7</b>", marker: { evil: true } });
    expect(html).not.toContain("<b>7");
    expect(html).not.toContain("object");
    expect(formatter([])).toBe("");
  });
});

describe("goleChartReady", () => {
  it("resizes the chart once the font is ready", async () => {
    const chart = { resize: vi.fn(), isDisposed: () => false };
    await goleChartReady(chart);
    expect(chart.resize).toHaveBeenCalledTimes(1);
  });

  it("skips a disposed chart and works without a chart", async () => {
    const chart = { resize: vi.fn(), isDisposed: () => true };
    await goleChartReady(chart, { build: "pua" });
    expect(chart.resize).not.toHaveBeenCalled();
    await expect(goleChartReady()).resolves.toBeUndefined();
  });
});

describe("with ECharts rendering to an SVG string", () => {
  it("draws Gole axis and series labels in the Gole font stack", () => {
    const chart = echarts.init(null, null, { renderer: "svg", ssr: true, width: 600, height: 400 });
    const option: echarts.EChartsOption = {
      animation: false,
      xAxis: { type: "category", data: ["Q1 2026", "Q2 2026"], axisLabel: goleAxisLabel() },
      yAxis: { type: "value", min: 0, max: 200, interval: 50, axisLabel: goleAxisLabel() },
      tooltip: { trigger: "axis", ...goleTooltip(), ...goleTooltipHTML() },
      series: [{ type: "bar", data: [123, 7], label: { show: true, ...goleLabel({ decimals: 2 }) } }],
    };
    chart.setOption(option);
    const svg = chart.renderToSVGString();
    for (const text of ["Q01 2026", "Q02 2026", "00", "50", "0100", "0150", "0200", "0123.00", "07.00"]) {
      expect(svg).toContain(`>${text}</text>`);
    }
    expect(svg).toMatch(/GoleStandard/);
    chart.dispose();
  });
});
