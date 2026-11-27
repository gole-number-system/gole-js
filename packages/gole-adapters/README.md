# @gole-number-system/gole-adapters

Small adapters that make popular chart and table libraries show numbers in the **Gole Number System** (base 100: one symbol for each pair of decimal digits). One package, one entry per library: Chart.js, Apache ECharts, AG Grid and TanStack Table. Each entry is a few plain functions that return ordinary options for that library, with no framework code.

> **Licence:** the code is open source under MIT. Showing Gole symbols uses the GoleStandard font and the Gole Number System, which are under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence). Free to use with attribution; conditions apply. See [Licence](#licence).

The padding rules come from [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core); the symbols come from the [GoleStandard font](https://github.com/esetu-solutions/gole-number-system-fonts). Both are installed with this package.

## Install

```sh
npm install @gole-number-system/gole-adapters
```

Then install the library you use, if you have not already. All four are optional peer dependencies, and an entry only refers to its own library's types, so nothing extra ends up in your bundle.

| Entry | Library |
| --- | --- |
| `@gole-number-system/gole-adapters/chartjs` | `chart.js` 4 |
| `@gole-number-system/gole-adapters/echarts` | `echarts` 5 or 6 |
| `@gole-number-system/gole-adapters/ag-grid` | `ag-grid-community` 33 or later |
| `@gole-number-system/gole-adapters/tanstack-table` | `@tanstack/table-core` 8 (also through `@tanstack/react-table`, `vue-table`, …) |

### Load the font

The adapters only produce text and markup. The page must load the GoleStandard font once, with the stylesheet from `gole-core`:

```ts
import "@gole-number-system/gole-core/gole.css";       // Ligature build (default)
// or: import "@gole-number-system/gole-core/gole-pua.css";   and pass { build: "pua" } to every adapter
```

Load one of the two, never both: the builds share one family name. Without a bundler, link the same file from a CDN or from `node_modules`.

## Use

### Options

Every function takes the same options:

| Option | Meaning |
| --- | --- |
| `build` | `"ligature"` (default) or `"pua"`; must match the stylesheet you loaded |
| `decimals` | Fixed number of fraction digits |
| `minPairs` | Minimum number of Gole symbols in the whole part |
| `format` | Locale-aware formatting, the options of core's `createGoleNumberFormat`: `{ locale: "en-IN", style: "currency", currency: "INR" }`, `{ style: "percent" }`, `{ notation: "compact" }` |
| `fallbackFont` | Chart entries only: the font for everything that is not a Gole digit |

### Chart.js

```ts
import { Chart } from "chart.js/auto";
import "@gole-number-system/gole-core/gole.css";
import { GolePlugin, goleTicks, goleTooltip } from "@gole-number-system/gole-adapters/chartjs";

Chart.register(GolePlugin); // draws charts again once the font has loaded

new Chart(canvas, {
  type: "bar",
  data: { labels: ["2024", "2025", "2026"], datasets: [{ label: "Sales", data: [1200, 1950, 2347.5] }] },
  options: {
    scales: {
      x: { ticks: goleTicks() },
      y: { ticks: goleTicks({ format: { locale: "en-IN", style: "currency", currency: "INR" } }) },
    },
    plugins: { tooltip: goleTooltip({ decimals: 2 }) },
  },
});
```

`goleChartFont(Chart)` sets the Gole font stack as the Chart.js default font, so digits in legends and titles are drawn as Gole symbols as well. Write the text for those with `goleChartText()` or core's `toGole()` so the digits are padded into pairs.

### Apache ECharts

```ts
import * as echarts from "echarts";
import "@gole-number-system/gole-core/gole.css";
import { goleAxisLabel, goleChartReady, goleLabel, goleTooltipHTML } from "@gole-number-system/gole-adapters/echarts";

const chart = echarts.init(element);
chart.setOption({
  xAxis: { type: "category", data: ["2024", "2025", "2026"], axisLabel: goleAxisLabel() },
  yAxis: { type: "value", axisLabel: goleAxisLabel() },
  tooltip: { trigger: "axis", ...goleTooltipHTML({ decimals: 2 }) },
  series: [{ name: "Sales", type: "bar", data: [1200, 1950, 2347.5], label: { show: true, position: "top", ...goleLabel() } }],
});
goleChartReady(chart); // same as goleReady().then(() => chart.resize())
```

There are two tooltip helpers:

- `goleTooltipHTML()` writes the tooltip itself. ECharts tooltips are HTML, so the digits get `<span class="gole">` and each number is a labelled `role="img"` element, as everywhere else on the page. Names are escaped.
- `goleTooltip()` keeps ECharts' own tooltip layout and only supplies `valueFormatter` and the font stack. Use it when you rely on the built-in layout or on `renderMode: "richText"`.

### AG Grid

```ts
import { AllCommunityModule, ModuleRegistry, createGrid } from "ag-grid-community";
import "@gole-number-system/gole-core/gole.css";
import { goleColDef } from "@gole-number-system/gole-adapters/ag-grid";

ModuleRegistry.registerModules([AllCommunityModule]);

createGrid(element, {
  columnDefs: [
    { field: "item" },
    { field: "quantity", ...goleColDef() },
    { field: "amount", ...goleColDef({ format: { locale: "en-IN", style: "currency", currency: "INR" } }) },
  ],
  rowData: [{ item: "Rice", quantity: 12, amount: 1234.5 }],
});
```

`goleColDef()` sets the cell renderer, right alignment, a comparator that sorts by decimal value (exact for bigints and long numeric strings) and a `valueFormatter` that returns the plain decimal text, which AG Grid uses for CSV export and the clipboard. To change only how cells look, use `cellRenderer: goleCellRenderer()` on its own. Cell values are escaped; they are never inserted as HTML.

### TanStack Table

TanStack Table is headless, so this entry gives you the sorting and filter functions and the data to render; the markup is yours.

With React and [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole):

```tsx
import { createColumnHelper } from "@tanstack/react-table";
import "@gole-number-system/react-gole/styles.css";
import { Gole } from "@gole-number-system/react-gole";
import { goleFilterFn, goleSortingFn } from "@gole-number-system/gole-adapters/tanstack-table";

const column = createColumnHelper<{ item: string; amount: string }>();

const columns = [
  column.accessor("item", {}),
  column.accessor("amount", {
    sortingFn: goleSortingFn,
    filterFn: goleFilterFn,
    cell: (context) => <Gole value={context.getValue()} decimals={2} />,
  }),
];
```

In plain DOM (or any framework that can set HTML), `goleCell()` returns ready-made, escaped markup:

```ts
import { goleCell } from "@gole-number-system/gole-adapters/tanstack-table";

const amount = goleCell({ format: { locale: "en-IN", style: "currency", currency: "INR" } });

for (const row of table.getRowModel().rows) {
  for (const cell of row.getVisibleCells()) {
    const td = document.createElement("td");
    if (cell.column.id === "amount") td.innerHTML = amount(cell.getContext()).html;
    else td.textContent = String(cell.getValue());
    tr.append(td);
  }
}
```

`goleCell()` also returns `text`, `label` and `segments`, for frameworks where you build the elements yourself: put `segment.integer` and `segment.fraction` in elements with class `gole` and everything else in plain text, inside an element with `role="img"` and `aria-label={label}`.

## Fonts on canvas

Tables are DOM, so the Gole font is applied to the digits only. Chart.js and ECharts draw on a canvas (or into SVG text), where one label is one string in one font. Three things follow:

- **Font stack.** The chart helpers set the font family to `"GoleStandard", <fallback>`. The Gole font contains only digits and Gole symbols, so the browser draws the digits with it and takes every other character (signs, decimal points, currency signs, letters) from the fallback. Change the fallback with `fallbackFont`, or build a stack yourself with `goleFontStack("Inter, sans-serif")`.
- **Redraw after the font loads.** Text drawn on a canvas before the font has loaded stays in the fallback font; unlike HTML, the browser does not repaint it. Register `GolePlugin` (Chart.js) or call `goleChartReady(chart)` (ECharts). Where you can, wait before creating the chart instead: `await goleReady()` from `gole-core`, or `await goleChartReady()`. Then the first layout already measures labels in the right font.
- **Ligature or PUA.** The Ligature build relies on the browser's text shaping to join each pair of digits. Current browsers shape canvas text the same way as HTML text, so it works. If you target an environment where you are not sure (older browsers, server-side canvas libraries, image export tools), use the PUA build: load `gole-pua.css` and pass `{ build: "pua" }`. Each pair is then one character and needs no shaping.

## API

### `@gole-number-system/gole-adapters/chartjs`

| Export | Returns |
| --- | --- |
| `goleTicks(options?)` | `{ callback, font }` for `scales.<id>.ticks`. Works on linear, logarithmic and category scales. |
| `goleScale(options?)` | `{ ticks: goleTicks(options) }` |
| `goleTooltip(options?)` | `{ callbacks: { title, label }, titleFont, bodyFont, footerFont }` for `plugins.tooltip` |
| `goleDataLabels(options?)` | `{ formatter, font }` for chartjs-plugin-datalabels. Object data points get no label. |
| `goleChartText(options?)` | `(value) => string`, for your own callbacks: numbers get the full options, strings are converted as text |
| `goleChartFont(Chart, options?)` | Sets `Chart.defaults.font.family` to the Gole font stack and returns it |
| `GolePlugin` | Plugin (id `gole`) that updates the chart once the font has loaded. Option: `plugins.gole.build`. |
| `CHARTJS_FALLBACK_FONT` | Chart.js's default font family, the default `fallbackFont` |

### `@gole-number-system/gole-adapters/echarts`

| Export | Returns |
| --- | --- |
| `goleAxisLabel(options?)` | `{ formatter, fontFamily }` for `axisLabel` on value, log and category axes |
| `goleLabel(options?)` | `{ formatter, fontFamily }` for a series `label` |
| `goleTooltip(options?)` | `{ valueFormatter, textStyle }` for `tooltip` |
| `goleTooltipHTML(options?)` | `{ formatter }` for `tooltip`: an HTML tooltip with proper Gole markup |
| `goleEChartsText(options?)` | `(value) => string`, for your own formatters |
| `goleChartReady(chart?, { build }?)` | Promise that resolves when the font has loaded; resizes (redraws) the chart if one is given |

### `@gole-number-system/gole-adapters/ag-grid`

| Export | Returns |
| --- | --- |
| `goleCellRenderer(options?)` | A function cell renderer that returns a `<span class="gole-cell">`. Extra option: `cellClass`. |
| `goleColDef(options?)` | `{ cellRenderer, valueFormatter, comparator, cellClass, headerClass }` to spread into a column definition |
| `goleComparator(a, b)` | The comparator on its own |

### `@gole-number-system/gole-adapters/tanstack-table`

| Export | Returns |
| --- | --- |
| `goleSortingFn` | A `SortingFn`: exact numeric order for numbers, bigints, long numeric strings and Gole text (both builds) |
| `goleFilterFn` | A `FilterFn`: a `[min, max]` filter value is a range, anything else is matched as text against the plain decimal number |
| `goleCell(options?)` | `(cellContext) => { text, label, segments, html }` |

### `@gole-number-system/gole-adapters`

The root entry holds the helpers the others share and imports none of the libraries.

| Export | Returns |
| --- | --- |
| `goleFontStack(fallback?)` | `'"GoleStandard", sans-serif'` |
| `compareGole(a, b)` | `-1`, `0` or `1` by decimal value. Empty values first, then numbers, then other text. |
| `createGoleAdapterFormat(options?)` | `{ text, label, segments, html, render, isNumber }` with the options above |
| `plainDecimal(value)` | The decimal text without padding: `"0123"` → `"123"` |

Types: `GoleAdapterOptions`, `GoleCanvasOptions`, `GoleRendering`, `GoleAdapterFormat`.

## Develop

This package lives in the [gole-js](https://github.com/gole-number-system/gole-js) repository, an npm workspace that also holds `gole-core`, the framework packages and the examples. Run the commands from the repository root:

```sh
npm install        # links the packages to each other
npm run build      # gole-core first, then the packages that use it
npm test
npm run typecheck
```

To work on this package alone, add `-w @gole-number-system/gole-adapters` to `npm run build`, `npm test` or `npm run typecheck`. Build `gole-core` first; this package imports its built output.

## Related packages

- [`@gole-number-system/gole-core`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-core): the padding logic and the stylesheets
- [`@gole-number-system/react-gole`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole): React components
- [`@gole-number-system/react-gole-charts`](https://github.com/gole-number-system/gole-js/tree/main/packages/react-gole-charts): Recharts components
- [`@gole-number-system/gole-elements`](https://github.com/gole-number-system/gole-js/tree/main/packages/gole-elements): web components
- [Examples](https://github.com/gole-number-system/gole-js/tree/main/examples): worked examples

## Licence

The code in this package is open source under the [MIT licence](LICENSE). The MIT licence covers the code only.

The GoleStandard font (installed with this package as `@esetu-solutions/gole-number-system-fonts`), the Gole Number System itself and the related patent rights are not covered by it. They are licensed by eSetu Solutions Pvt Ltd under the [Gole Number System Community Licence v1.0](https://www.esetu.in/gole-number-system/licence), which everyone who uses the font receives automatically. Free to use with attribution; conditions apply. See the [full terms](https://www.esetu.in/gole-number-system/licence), or contact [legal@esetu.in](mailto:legal@esetu.in) about a commercial licence.

The MIT licence grants no patent licence. Patent rights for the Gole Number System (Indian Patent Application No. 202441034973) are granted only under §2.6 of the Community Licence.

When you show Gole numbers, credit them as `Gole Number System™ by eSetu Solutions Pvt. Ltd. – https://esetu.in`. Gole Number System and eSetu are trademarks of eSetu.
