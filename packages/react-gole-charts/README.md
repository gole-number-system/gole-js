# @gole-number-system/react-gole-charts

[Recharts](https://recharts.org) components that show their numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits).

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

Each component is a drop-in replacement for the Recharts component of the same name and accepts the same props.

## Install

```sh
npm install @gole-number-system/react-gole-charts recharts
```

Needs React 18 or 19 and Recharts 3. `@gole-number-system/react-gole` and `@gole-number-system/gole-core` are installed with it.

## Quick start

```tsx
import "@gole-number-system/react-gole/styles.css"; // loads the font, once in your app
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { GoleLabelList, GoleTooltip, GoleXAxis, GoleYAxis } from "@gole-number-system/react-gole-charts";

<ResponsiveContainer width="100%" height={280}>
  <BarChart data={data}>
    <GoleXAxis dataKey="day" />
    <GoleYAxis />
    <GoleTooltip />
    <Bar dataKey="parcels">
      <GoleLabelList dataKey="parcels" position="top" />
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

## Components

| Component | Replaces | What shows in Gole |
| --- | --- | --- |
| `<GoleXAxis>`, `<GoleYAxis>` | `XAxis`, `YAxis` | Tick labels, including numbers inside category labels such as `Mon 16` |
| `<GolePolarAngleAxis>`, `<GolePolarRadiusAxis>` | `PolarAngleAxis`, `PolarRadiusAxis` | Tick labels on radar and radial charts |
| `<GoleTooltip>` | `Tooltip` | The label and every value |
| `<GoleLegend>` | `Legend` | Numbers in series names, such as `2026` |
| `<GoleLabelList>` | `LabelList` | Data labels on bars, lines and pie slices |
| `<GoleLabel>` | `Label` | A single label, for example on a `ReferenceLine` |
| `<GoleTick>` | a custom `tick` | The tick renderer the axes use, for when you build your own axis |

Helpers: `goleFormatter(options)` returns a `(value) => string` for any Recharts `formatter` or `tickFormatter` prop, and `goleFontFamily(fallback?)` returns the `font-family` value to put on text you draw yourself.

Every component also accepts the Gole options `decimals`, `minPairs`, `build`, `decimalSeparator` and `grouping`, and reads defaults from `<GoleProvider>`.

### Why these components

Numbers appear in four places on a chart: axis ticks, tooltips, legends and data labels. There is one component for each, so converting a chart is a matter of changing imports. The chart containers and the marks (`Bar`, `Line`, `Area`, `Pie`) draw no numbers, so they are not wrapped; keep using them from Recharts.

Axis ticks are SVG text, where a font cannot be applied to part of a string with CSS classes alone. `GoleTick` splits each label into `<tspan>` runs so that only the digits use the Gole font and letters keep the chart font.

### Notes

- An axis `tickFormatter` still runs first; its output is then converted.
- Passing `tick={false}`, an element or a function to an axis is passed through to Recharts unchanged. A style object such as `tick={{ fill: "#666", fontSize: 13 }}` is applied to the Gole tick.
- The series name in `GoleTooltip` is left as text, because Recharts only prints string names there. Values and the label are converted.
- Gole symbols are denser than digits. Use a tick font size of about 16px or more.

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core`, `react-gole` and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # every package, in dependency order
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/react-gole-charts` to `npm run build`, `npm test` or `npm run typecheck`. Build `gole-core` and `react-gole` first; this package imports their built output.

## Related packages

- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): React components
- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples, including charts

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
