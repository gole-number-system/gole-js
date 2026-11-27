import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Bar, BarChart, Line, LineChart, PolarGrid, Radar, RadarChart, ReferenceLine, XAxis } from "recharts";
import { GoleProvider } from "@gole-number-system/react-gole";
import {
  GoleLabel,
  GoleLabelList,
  GoleLegend,
  GolePolarAngleAxis,
  GolePolarRadiusAxis,
  GoleTick,
  GoleTooltip,
  GoleXAxis,
  GoleYAxis,
  goleFormatter,
} from "../src";

afterEach(cleanup);

const data = [
  { year: 2025, month: "Jan 2025", sales: 250, cost: 7.5 },
  { year: 2026, month: "Feb 2026", sales: 1000, cost: 12.25 },
];

const texts = (root: Element, selector: string) => [...root.querySelectorAll(selector)].map((n) => n.textContent);

describe("axes", () => {
  it("GoleXAxis and GoleYAxis render ticks in Gole, digits only in the Gole font", () => {
    const { container } = render(
      <LineChart width={500} height={300} data={data}>
        <GoleXAxis dataKey="month" />
        <GoleYAxis domain={[0, 1000]} ticks={[0, 250, 1000]} />
        <Line dataKey="sales" isAnimationActive={false} />
      </LineChart>,
    );
    expect(texts(container, "text.gole-tick.recharts-xAxis")).toEqual(["Jan 2025", "Feb 2026"]);
    expect(texts(container, "text.gole-tick.recharts-yAxis")).toEqual(["00", "0250", "1000"]);
    expect(texts(container, 'text.recharts-xAxis tspan[font-family="GoleStandard"]')).toEqual(["2025", "2026"]);
    expect(container.querySelector("text.gole-tick.recharts-yAxis")!.getAttribute("aria-label")).toBe("0");
  });

  it("runs tickFormatter first, applies decimals and tick styling, honours the provider", () => {
    const { container } = render(
      <GoleProvider build="pua">
        <LineChart width={500} height={300} data={data}>
          <GoleXAxis dataKey="year" tickFormatter={(v) => `FY ${v}`} tick={{ fontSize: 10 }} />
          <GoleYAxis dataKey="cost" ticks={[0, 7.5]} domain={[0, 8]} decimals={2} />
          <Line dataKey="cost" isAnimationActive={false} />
        </LineChart>
      </GoleProvider>,
    );
    expect(texts(container, "text.gole-tick.recharts-xAxis")).toEqual(["FY ", "FY "]);
    expect(container.querySelector("text.gole-tick.recharts-xAxis")!.getAttribute("font-size")).toBe("10");
    expect(texts(container, "text.gole-tick.recharts-yAxis")).toEqual([".", "."]);
  });

  it("GoleTick works on a plain Recharts axis", () => {
    const { container } = render(
      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="year" tick={<GoleTick />} />
        <Line dataKey="sales" isAnimationActive={false} />
      </LineChart>,
    );
    expect(texts(container, ".gole-tick")).toEqual(["2025", "2026"]);
  });

  it("polar axes", () => {
    const { container } = render(
      <RadarChart width={400} height={400} data={data}>
        <PolarGrid />
        <GolePolarAngleAxis dataKey="year" />
        <GolePolarRadiusAxis domain={[0, 1000]} tickCount={3} />
        <Radar dataKey="sales" isAnimationActive={false} />
      </RadarChart>,
    );
    expect(texts(container, ".recharts-polar-angle-axis .gole-tick")).toEqual(["2025", "2026"]);
    expect(texts(container, ".recharts-polar-radius-axis .gole-tick")).toEqual(["00", "0500", "1000"]);
  });
});

describe("labels, legend and tooltip", () => {
  it("GoleLabelList and GoleLabel", () => {
    const { container } = render(
      <BarChart width={500} height={300} data={data}>
        <Bar dataKey="cost" isAnimationActive={false}>
          <GoleLabelList dataKey="cost" position="top" decimals={1} />
        </Bar>
        <ReferenceLine y={10}>
          <GoleLabel value={10} position="insideTopRight" />
        </ReferenceLine>
      </BarChart>,
    );
    const labels = [...container.querySelectorAll(".recharts-label-list text")];
    expect(labels.length).toBe(2);
    expect(labels.map((n) => n.textContent)).toEqual(["07.50", "12.30"]);
    expect(labels[0]!.getAttribute("font-family")).toBe('"GoleStandard", system-ui, sans-serif');
    expect(texts(container, "text.recharts-label").at(-1)).toBe("10");
  });

  it("GoleLegend and GoleTooltip", () => {
    const { container } = render(
      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="year" />
        <GoleLegend />
        <GoleTooltip defaultIndex={1} decimals={2} />
        <Line dataKey="sales" name="Sales 2026" isAnimationActive={false} />
      </LineChart>,
    );
    expect(texts(container, ".recharts-legend-item-text")).toEqual(["Sales 2026"]);
    expect(texts(container, ".recharts-legend-item-text .gole")).toEqual(["2026"]);
    expect(container.querySelector(".recharts-tooltip-label")!.textContent).toBe("2026");
    expect(container.querySelector(".recharts-tooltip-label .gole")).not.toBeNull();
    expect(container.querySelector(".recharts-tooltip-item-value")!.textContent).toBe("1000.00");
    expect(container.querySelector(".recharts-tooltip-item-name")!.textContent).toBe("Sales 2026");
  });

  it("goleFormatter", () => {
    expect(goleFormatter({ decimals: 1 })(7)).toBe("07.00");
    expect(goleFormatter()(null)).toBe("");
  });
});
