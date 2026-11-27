import { toGole } from "@gole-number-system/gole-core";
import { Chart, registerables, type ChartConfiguration, type Scale, type TooltipItem } from "chart.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHARTJS_FALLBACK_FONT,
  GolePlugin,
  goleChartFont,
  goleChartText,
  goleDataLabels,
  goleScale,
  goleTicks,
  goleTooltip,
} from "../src/chartjs";

const linear = { type: "linear" } as Scale;
const tick = (options: Parameters<typeof goleTicks>[0], value: number | string, scale = linear) =>
  goleTicks(options).callback.call(scale, value, 0, []);

describe("goleTicks", () => {
  it("pads tick values into pairs", () => {
    expect(tick({}, 5)).toBe("05");
    expect(tick({}, 1200)).toBe("1200");
    expect(tick({}, 150)).toBe("0150");
    expect(tick({}, -2.5)).toBe("-02.50");
    expect(tick({ decimals: 2 }, 12747.2)).toBe("012747.20");
    expect(tick({ minPairs: 2 }, 7)).toBe("0007");
  });

  it("removes floating point noise from computed ticks", () => {
    expect(tick({}, 0.1 + 0.2)).toBe("00.30");
  });

  it("supports the PUA build", () => {
    expect(tick({ build: "pua" }, 123)).toBe(toGole(123, { build: "pua" }));
  });

  it("supports currency, percent and compact formats", () => {
    expect(tick({ format: { locale: "en-IN", style: "currency", currency: "INR" } }, 1234.5)).toBe("₹1234.50");
    expect(tick({ format: { locale: "en-US", style: "percent" } }, 0.46)).toBe("46%");
    expect(tick({ format: { locale: "en-US", notation: "compact" } }, 12000)).toBe("12K");
  });

  it("looks up the label on a category scale", () => {
    const labels = ["Q1 2026", "2025"];
    const category = { type: "category", getLabelForValue: (index: number) => labels[index] } as unknown as Scale;
    expect(tick({}, 0, category)).toBe("Q01 2026");
    // `decimals` is for numbers, not for labels that happen to be digits.
    expect(tick({ decimals: 2 }, 1, category)).toBe("2025");
  });

  it("sets the Gole font stack", () => {
    expect(goleTicks().font.family).toBe(`"GoleStandard", ${CHARTJS_FALLBACK_FONT}`);
    expect(goleTicks({ fallbackFont: "Inter" }).font.family).toBe('"GoleStandard", Inter');
    expect(goleScale({ fallbackFont: "Inter" }).ticks.font.family).toBe('"GoleStandard", Inter');
    expect(goleScale().ticks.callback.call(linear, 7, 0, [])).toBe("07");
  });
});

describe("goleChartText", () => {
  it("formats numbers and converts text", () => {
    const text = goleChartText({ decimals: 1 });
    expect(text(12.5)).toBe("12.50");
    expect(text("Week 7")).toBe("Week 07");
    expect(text(null)).toBe("");
    expect(text(12n)).toBe("12.00");
  });
});

describe("goleTooltip", () => {
  const item = (fields: object) => ({ chart: { options: {} }, dataset: {}, ...fields }) as unknown as TooltipItem<"bar">;

  it("writes label and value in Gole", () => {
    const { callbacks } = goleTooltip({ decimals: 2 });
    expect(
      callbacks.label(item({ dataset: { label: "Sales 2026" }, parsed: { x: 0, y: 1234.5 }, formattedValue: "1,234.5" })),
    ).toBe("Sales 2026: 1234.50");
    expect(callbacks.label(item({ parsed: { x: 3, y: 7 } }))).toBe("07.00");
  });

  it("reads the value axis of horizontal bars, pies and radial charts", () => {
    const { callbacks } = goleTooltip();
    expect(callbacks.label(item({ chart: { options: { indexAxis: "y" } }, parsed: { x: 150, y: 0 } }))).toBe("0150");
    expect(callbacks.label(item({ dataset: { indexAxis: "y" }, parsed: { x: 150, y: 0 } }))).toBe("0150");
    expect(callbacks.label(item({ parsed: 42 }))).toBe("42");
    expect(callbacks.label(item({ parsed: { r: 5 } }))).toBe("05");
    expect(callbacks.label(item({ parsed: {}, formattedValue: "n 7" }))).toBe("n 07");
  });

  it("converts the title as text", () => {
    const { callbacks } = goleTooltip({ decimals: 2 });
    expect(callbacks.title([item({ label: "March 5" })])).toBe("March 05");
    expect(callbacks.title([])).toBe("");
  });

  it("sets the fonts", () => {
    const tooltip = goleTooltip({ fallbackFont: "Inter" });
    expect(tooltip.titleFont.family).toBe('"GoleStandard", Inter');
    expect(tooltip.bodyFont.family).toBe('"GoleStandard", Inter');
    expect(tooltip.footerFont.family).toBe('"GoleStandard", Inter');
  });
});

describe("goleDataLabels", () => {
  it("formats primitive values and skips objects", () => {
    const labels = goleDataLabels({ fallbackFont: "Inter" });
    expect(labels.formatter(123)).toBe("0123");
    expect(labels.formatter({ x: 1, y: 2 })).toBeNull();
    expect(labels.formatter(null)).toBe("");
    expect(labels.font.family).toBe('"GoleStandard", Inter');
  });
});

describe("goleChartFont", () => {
  it("sets the default font family once", () => {
    const fake = { defaults: { font: { family: "Arial" } as { family?: string } } };
    expect(goleChartFont(fake)).toBe('"GoleStandard", Arial');
    expect(goleChartFont(fake)).toBe('"GoleStandard", Arial');
    expect(fake.defaults.font.family).toBe('"GoleStandard", Arial');
    expect(goleChartFont({ defaults: { font: {} } }, { fallbackFont: "Inter" })).toBe('"GoleStandard", Inter');
  });
});

describe("GolePlugin", () => {
  it("updates the chart after the font is ready", async () => {
    const scale = { _longestTextCache: { stale: true } };
    const chart = { attached: true, ctx: {}, scales: { x: scale }, update: vi.fn() };
    GolePlugin.afterInit!(chart as unknown as Chart, {}, {});
    expect(chart.update).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chart.update).toHaveBeenCalledWith("none");
    expect(scale._longestTextCache).toEqual({});
  });

  it("leaves a destroyed chart alone", async () => {
    const chart = { attached: false, ctx: null, scales: {}, update: vi.fn() };
    GolePlugin.afterInit!(chart as unknown as Chart, {}, {});
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chart.update).not.toHaveBeenCalled();
  });
});

describe("with Chart.js and a mocked canvas context", () => {
  afterEach(() => vi.restoreAllMocks());

  it("draws Gole tick labels in the Gole font stack", async () => {
    const drawn: { text: string; font: string }[] = [];
    const state: Record<string, unknown> = { font: "10px sans-serif" };
    const context: object = new Proxy(state, {
      get(target, key: string) {
        if (key in target) return target[key];
        if (key === "measureText") return (text: string) => ({ width: text.length * 6 });
        if (key === "fillText") return (text: string) => void drawn.push({ text, font: String(target.font) });
        if (key === "createLinearGradient") return () => ({ addColorStop() {} });
        if (key === "getLineDash") return () => [];
        return () => undefined;
      },
      set(target, key: string, value) {
        target[key] = value;
        return true;
      },
    });
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    state.canvas = canvas;
    vi.spyOn(canvas, "getContext").mockReturnValue(context as never);
    document.body.append(canvas);

    Chart.register(...registerables, GolePlugin);
    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: { labels: ["2024", "Q1 2025"], datasets: [{ label: "Sales", data: [100, 200] }] },
      options: {
        responsive: false,
        animation: false,
        devicePixelRatio: 1,
        scales: { x: { ticks: goleTicks() }, y: goleScale({ decimals: 2 }) },
        plugins: { tooltip: goleTooltip(), legend: { display: false } },
      },
    };
    const chart = new Chart(canvas, config);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const texts = drawn.map((entry) => entry.text);
    expect(texts).toContain("2024");
    expect(texts).toContain("Q01 2025");
    expect(texts).toContain("0200.00");
    expect(texts).toContain("00.00");
    expect(drawn.find((entry) => entry.text === "0200.00")!.font).toContain('"GoleStandard"');
    expect(chart.scales.y!.ticks.map((entry) => entry.label)).toContain("0100.00");
    chart.destroy();
  });
});
