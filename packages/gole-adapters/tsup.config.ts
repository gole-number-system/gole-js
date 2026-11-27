import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/chartjs.ts", "src/echarts.ts", "src/ag-grid.ts", "src/tanstack-table.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2020",
  // Types only: none of the libraries may end up in the bundles.
  external: ["chart.js", "echarts", "ag-grid-community", "@tanstack/table-core"],
});
