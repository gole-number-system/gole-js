import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer } from "recharts";
import {
  GoleLabel,
  GoleLabelList,
  GoleLegend,
  GoleTooltip,
  GoleXAxis,
  GoleYAxis,
} from "@gole-number-system/react-gole-charts";

const revenue = [
  { month: "Jan", 2025: 4120, 2026: 4890 },
  { month: "Feb", 2025: 3980, 2026: 5240 },
  { month: "Mar", 2025: 4650, 2026: 5710 },
  { month: "Apr", 2025: 5020, 2026: 6180 },
  { month: "May", 2025: 5480, 2026: 6025 },
  { month: "Jun", 2025: 5310, 2026: 6940 },
];

const shipments = [
  { day: "Mon 16", parcels: 1284 },
  { day: "Tue 17", parcels: 1342 },
  { day: "Wed 18", parcels: 1295 },
  { day: "Thu 19", parcels: 1610 },
  { day: "Fri 20", parcels: 1893 },
  { day: "Sat 21", parcels: 942 },
];
const target = 1500;

const axis = { stroke: "var(--line)", tick: { fill: "var(--muted)", fontSize: 16 } };

/** Recharts with Gole axes, tooltip, legend and data labels. Swap the Recharts parts for the Gole ones. */
export function Charts() {
  return (
    <div className="charts">
      <figure>
        <figcaption>Revenue by month, ₹ thousand</figcaption>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenue} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <GoleXAxis dataKey="month" {...axis} tickLine={false} />
            <GoleYAxis {...axis} axisLine={false} tickLine={false} width={48} domain={[3000, 7000]} />
            <GoleTooltip />
            <GoleLegend />
            <Line dataKey="2025" stroke="var(--series-1)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
            <Line dataKey="2026" stroke="var(--series-2)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </figure>

      <figure>
        <figcaption>Parcels shipped per day, with the daily target</figcaption>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={shipments} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="28%">
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <GoleXAxis dataKey="day" {...axis} tickLine={false} />
            <GoleYAxis {...axis} axisLine={false} tickLine={false} width={48} />
            <GoleTooltip cursor={{ fill: "var(--line)", opacity: 0.4 }} />
            <ReferenceLine y={target} stroke="var(--muted)" strokeDasharray="4 4">
              <GoleLabel value={target} position="insideBottomRight" fill="var(--muted)" fontSize={16} />
            </ReferenceLine>
            <Bar dataKey="parcels" name="Parcels" fill="var(--series-1)" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <GoleLabelList dataKey="parcels" position="top" fill="var(--text)" fontSize={17} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </figure>
    </div>
  );
}
