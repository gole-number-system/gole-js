import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/define.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    target: "es2020",
  },
  {
    // <script src=".../define.global.js"> registers the elements and exposes window.GoleElements
    entry: { define: "src/global.ts" },
    format: ["iife"],
    globalName: "GoleElements",
    minify: true,
    target: "es2020",
    noExternal: [/.*/],
  },
]);
